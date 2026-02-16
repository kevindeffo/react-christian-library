# Migration Backend : localStorage/IndexedDB → Supabase

## Contexte

L'app React 19 + Vite stocke tout en local (localStorage pour users/books/progress, IndexedDB pour les PDFs binaires). Il y a **deux systèmes de livres séparés** (bookService + libraryService) qui seront unifiés. Les mots de passe sont en clair, les sessions sont des tokens base64. Cette migration remplace tout par Supabase : Auth, PostgreSQL, et Storage pour les PDFs.

---

## Phase 1 : Setup Supabase (projet + deps + client)

### 1.1 Créer le projet Supabase
- Créer un projet sur supabase.com
- Récupérer l'URL et la clé `anon`

### 1.2 Fichiers
| Fichier | Action |
|---------|--------|
| `.env` | **Créer** — `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |
| `.env.example` | **Créer** — template sans les vrais secrets |
| `.gitignore` | **Modifier** — ajouter `.env` et `.env.local` |
| `src/lib/supabase.js` | **Créer** — `createClient()` avec les env vars |

### 1.3 Dépendance
```bash
npm install @supabase/supabase-js
```

---

## Phase 2 : Schéma PostgreSQL

Exécuter dans le SQL Editor de Supabase :

### Tables

**`user_profiles`** — étend `auth.users`
- `id` UUID PK → `auth.users(id)` ON DELETE CASCADE
- `name` TEXT
- `role` TEXT ('user' | 'admin') DEFAULT 'user'
- `created_at`, `updated_at` TIMESTAMPTZ

**`categories`**
- `id` TEXT PK (ex: 'fiction', 'christian')
- `name`, `color`, `icon`, `description` TEXT
- `created_at`, `updated_at` TIMESTAMPTZ

**`books`** — unifie bookService + libraryService
- `id` UUID PK DEFAULT uuid_generate_v4()
- `name`, `author`, `description` TEXT
- `category` TEXT FK → `categories(id)`
- `pdf_url` TEXT (chemin Supabase Storage)
- `cover_url` TEXT
- `pdf_size` BIGINT
- `total_pages` INTEGER
- `price` NUMERIC(10,2) DEFAULT 0
- `created_by` UUID FK → `auth.users(id)`
- `created_at`, `updated_at` TIMESTAMPTZ
- `search_vector` tsvector GENERATED (french, name + author + description)

**`reading_progress`**
- `id` UUID PK
- `user_id` UUID FK → `auth.users(id)` ON DELETE CASCADE
- `book_id` UUID FK → `books(id)` ON DELETE CASCADE
- `current_page` INTEGER, `total_pages` INTEGER
- `progress` INTEGER GENERATED (current_page/total_pages * 100)
- `last_read_at` TIMESTAMPTZ
- UNIQUE(`user_id`, `book_id`)

### Triggers
- `update_updated_at_column()` — auto-update `updated_at` sur categories, books, user_profiles
- `handle_new_user()` — auto-crée un `user_profiles` après inscription auth

### Indexes
- `books(category)`, `books(created_at DESC)`, `books USING GIN(search_vector)`
- `reading_progress(user_id)`, `reading_progress(book_id)`, `reading_progress(last_read_at DESC)`

### Row Level Security (RLS)
| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|---------------------|
| `categories` | Tout le monde | Admins seulement |
| `books` | Tout le monde | Admins seulement |
| `reading_progress` | Propre user + admins | Propre user seulement |
| `user_profiles` | Propre profil + admins | Propre profil (sauf role) |

### Storage Buckets
- `book-pdfs` — privé, RLS : lecture publique, upload/delete admins
- `book-covers` — public, upload admins

### Seed Data
- INSERT les 12 catégories depuis `categories.json`
- Créer 2 users via Supabase Auth (admin + user), mettre role='admin' sur le premier

### SQL Complet

```sql
-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: user_profiles
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748b',
  icon TEXT NOT NULL DEFAULT '📑',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: books
-- ============================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  price NUMERIC(10, 2) DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  pdf_url TEXT,
  pdf_size BIGINT,
  cover_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('french', coalesce(name, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- ============================================
-- TABLE: reading_progress
-- ============================================
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 1,
  total_pages INTEGER,
  progress INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN total_pages IS NULL OR total_pages = 0 THEN 0
      ELSE LEAST(100, ROUND((current_page::NUMERIC / total_pages::NUMERIC) * 100))
    END
  ) STORED,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_created_by ON books(created_by);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_search_vector ON books USING GIN(search_vector);
CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX idx_reading_progress_last_read ON reading_progress(last_read_at DESC);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are modifiable by admins"
  ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Books
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT USING (true);
CREATE POLICY "Books are creatable by admins"
  ON books FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Books are updatable by admins"
  ON books FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Books are deletable by admins"
  ON books FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Reading Progress
CREATE POLICY "Users can view their own reading progress"
  ON reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reading progress"
  ON reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reading progress"
  ON reading_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reading progress"
  ON reading_progress FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reading progress"
  ON reading_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User Profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- STORAGE POLICIES
-- ============================================
CREATE POLICY "PDFs are viewable by everyone"
  ON storage.objects FOR SELECT USING (bucket_id = 'book-pdfs');
CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'book-pdfs'
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update PDFs"
  ON storage.objects FOR UPDATE USING (
    bucket_id = 'book-pdfs'
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete PDFs"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'book-pdfs'
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Covers are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "Admins can upload covers"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'book-covers'
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- SEED: Categories
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
```

---

## Phase 3 : Migration des Services

### 3.1 `src/services/authService.js` — **Réécrire**
Remplacer localStorage par Supabase Auth :
- `login()` → `supabase.auth.signInWithPassword()` + fetch `user_profiles` pour le rôle
- `register()` → `supabase.auth.signUp()` avec metadata `name`
- `logout()` → `supabase.auth.signOut()`
- `getCurrentUser()` → `supabase.auth.getUser()` + join `user_profiles`
- `getCurrentSession()` → `supabase.auth.getSession()`
- `isAuthenticated()` / `isAdmin()` → dérivés de getSession/getCurrentUser
- `updateProfile()` → update `user_profiles` table
- `changePassword()` → `supabase.auth.updateUser({ password })`

### 3.2 `src/services/bookService.js` — **Réécrire**
Remplacer localStorage par Supabase Database + Storage :
- `getAllBooks()` → `supabase.from('books').select('*')`
- `getBookById()` → `.eq('id', bookId).single()`
- `getBooksByCategory()` → `.eq('category', categoryId)`
- `searchBooks()` → `.textSearch('search_vector', query)` avec fallback ILIKE
- `addBook(bookData, pdfFile)` → upload PDF dans Storage + insert dans books
- `updateBook()` → `.update()` + re-upload PDF si changé
- `deleteBook()` → delete DB + delete Storage
- `getBookStats()` → select + agrégation côté client
- Mapping snake_case → camelCase dans chaque retour

### 3.3 `src/services/readingProgressService.js` — **Réécrire**
Remplacer localStorage par Supabase Database :
- `saveReadingProgress()` → `.upsert()` avec `onConflict: 'user_id,book_id'`
- `getReadingProgress()` → `.eq('user_id').eq('book_id').single()`
- `getUserReadingProgress()` → `.eq('user_id')`
- `getRecentlyReadBooks()` → `.order('last_read_at').limit(n)`
- `getReadingStats()` → select + calcul côté client

### 3.4 `src/services/categoryService.js` — **Créer** (nouveau)
- `getAllCategories()` → `supabase.from('categories').select('*')`
- `getCategoryById()` → `.eq('id').single()`

### 3.5 `src/services/libraryService.js` — **Supprimer**
Fusionné dans `bookService.js`. Plus d'IndexedDB.

---

## Phase 4 : Context et Hooks

### 4.1 `src/context/AuthContext.jsx` — **Modifier**
- Init : `getCurrentUser()` async au mount
- Ajouter `supabase.auth.onAuthStateChange()` listener pour sync auto
- `login/register/logout` → délèguent aux services (déjà le cas)
- `updateUser()` → recharge depuis Supabase après update

### 4.2 `src/hooks/useBooks.js` — **Modifier**
- Remplacer imports de `libraryService` par `bookService`
- `addBook(bookData, pdfFile)` — passer le fichier PDF en 2e argument
- Le reste de l'interface reste identique

### 4.3 `src/hooks/useCategories.js` — **Modifier**
- Remplacer import statique `categories.json` par `categoryService.getAllCategories()`
- Le reste de l'interface reste identique

---

## Phase 5 : Pages à adapter

Les pages qui importent directement des configs/services doivent être mises à jour :

| Page | Changement |
|------|-----------|
| `admin/AddBookPage.jsx` | `addBook(bookData, selectedFile)` — passer le PDF en argument |
| `admin/DashboardPage.jsx` | Imports depuis `bookService` au lieu de `libraryService` |
| `admin/BooksManagementPage.jsx` | Imports depuis `bookService` |
| `admin/CategoriesManagementPage.jsx` | Imports depuis `categoryService` au lieu de `libraryService.CATEGORIES` |
| `BookDetailsPage.jsx` | `getBookById` depuis `bookService`, URL PDF depuis Supabase Storage |
| `ReaderPage.jsx` | Charger le PDF via URL Supabase Storage au lieu de Blob local |
| `CatalogPage.jsx` | `getAllBooks` depuis `bookService` |
| `MyBooksPage.jsx` | Progress depuis `readingProgressService` + books depuis `bookService` |
| `EditProfilePage.jsx` | `updateProfile` depuis `authService` |

---

## Phase 6 : Nettoyage

| Action | Fichiers |
|--------|----------|
| **Supprimer** | `src/services/libraryService.js` |
| **Supprimer** | `src/config/users.json`, `src/config/books.json`, `src/config/readingProgress.json` |
| **Garder** | `src/config/categories.json` (backup/référence) |
| **Modifier** | `src/utils/constants.js` — supprimer `DB_CONFIG`, `STORAGE_KEYS.USER_SESSION` |

---

## Vérification

1. `npm run build` — zéro erreurs
2. Tester le flow complet :
   - Inscription → profil créé dans `user_profiles`
   - Connexion → session Supabase active
   - Catalogue → livres chargés depuis PostgreSQL
   - Ajout livre (admin) → PDF uploadé dans Storage + row dans `books`
   - Lecture → progression sauvegardée dans `reading_progress`
   - Suppression livre → cascade supprime progress + fichier Storage
   - Déconnexion → session supprimée
3. Vérifier RLS : un user normal ne peut pas ajouter/supprimer des livres
4. Vérifier dans le dashboard Supabase que les données sont bien là
