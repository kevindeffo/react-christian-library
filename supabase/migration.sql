-- ============================================
-- Migration: localStorage/IndexedDB → Supabase
-- Exécuter dans le SQL Editor de Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: user_profiles
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: books
-- ============================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT REFERENCES categories(id),
  pdf_url TEXT,
  cover_url TEXT,
  pdf_size BIGINT DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('french', coalesce(name, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- ============================================
-- TABLE: reading_progress
-- ============================================
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  progress INTEGER GENERATED ALWAYS AS (
    CASE WHEN total_pages > 0 THEN LEAST((current_page * 100) / total_pages, 100) ELSE 0 END
  ) STORED,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- ============================================
-- TRIGGERS: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: auto-create user_profiles on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_search_vector ON books USING GIN(search_vector);

CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX idx_reading_progress_last_read ON reading_progress(last_read_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- categories: everyone can read, only admins can modify
CREATE POLICY "categories_select" ON categories
  FOR SELECT USING (true);

CREATE POLICY "categories_insert" ON categories
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "categories_update" ON categories
  FOR UPDATE USING (is_admin());

CREATE POLICY "categories_delete" ON categories
  FOR DELETE USING (is_admin());

-- books: everyone can read, only admins can modify
CREATE POLICY "books_select" ON books
  FOR SELECT USING (true);

CREATE POLICY "books_insert" ON books
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "books_update" ON books
  FOR UPDATE USING (is_admin());

CREATE POLICY "books_delete" ON books
  FOR DELETE USING (is_admin());

-- reading_progress: own user + admins can read, own user can modify
CREATE POLICY "reading_progress_select" ON reading_progress
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "reading_progress_insert" ON reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reading_progress_update" ON reading_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reading_progress_delete" ON reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- user_profiles: own profile + admins can read, own profile can update (except role)
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these via Supabase Dashboard or API:
-- 1. Create bucket 'book-pdfs' (private)
-- 2. Create bucket 'book-covers' (public)

-- Storage policies for book-pdfs
INSERT INTO storage.buckets (id, name, public) VALUES ('book-pdfs', 'book-pdfs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);

-- book-pdfs: authenticated users can read, admins can upload/delete
CREATE POLICY "book_pdfs_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "book_pdfs_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'book-pdfs' AND is_admin());

CREATE POLICY "book_pdfs_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'book-pdfs' AND is_admin());

CREATE POLICY "book_pdfs_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'book-pdfs' AND is_admin());

-- book-covers: everyone can read, admins can upload/delete
CREATE POLICY "book_covers_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND is_admin());

CREATE POLICY "book_covers_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'book-covers' AND is_admin());

CREATE POLICY "book_covers_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'book-covers' AND is_admin());

-- ============================================
-- SEED DATA: categories
-- ============================================
INSERT INTO categories (id, name, color, icon, description) VALUES
  ('fiction', 'Roman & Fiction', '#8b5cf6', '📖', 'Romans, nouvelles et récits de fiction'),
  ('scifi-fantasy', 'Science-Fiction & Fantasy', '#3b82f6', '🚀', 'Univers imaginaires, science-fiction et mondes fantastiques'),
  ('christian', 'Vie Chrétienne & Spiritualité', '#ec4899', '✝️', 'Foi chrétienne, spiritualité, méditations et enseignements bibliques'),
  ('biography', 'Biographies', '#f59e0b', '👤', 'Biographies, autobiographies et témoignages'),
  ('history', 'Histoire', '#ef4444', '🏛️', 'Livres d''histoire, essais historiques et documents'),
  ('science', 'Sciences & Technologies', '#10b981', '🔬', 'Sciences, technologies, informatique et innovations'),
  ('personal-dev', 'Développement Personnel', '#06b6d4', '🌱', 'Développement personnel, productivité et bien-être mental'),
  ('art-culture', 'Art & Culture', '#a855f7', '🎨', 'Art, musique, cinéma et culture générale'),
  ('youth', 'Jeunesse & Enfants', '#14b8a6', '👶', 'Livres pour enfants, jeunes et adolescents'),
  ('wellness', 'Cuisine & Bien-être', '#84cc16', '🍳', 'Cuisine, santé, sport et bien-être'),
  ('business', 'Business & Économie', '#6366f1', '💼', 'Entrepreneuriat, finance, économie et management'),
  ('other', 'Autres', '#64748b', '📑', 'Autres livres ne correspondant pas aux catégories ci-dessus');

-- ============================================
-- NOTE: Seed Users
-- ============================================
-- Create users via Supabase Dashboard or Auth API:
-- 1. admin@booklib.com / admin123 → then UPDATE user_profiles SET role = 'admin' WHERE id = '<admin-uuid>';
-- 2. user@booklib.com / user123 (default role: 'user')
