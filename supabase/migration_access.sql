-- ============================================
-- Migration: Contrôle d'accès par livre
-- Exécuter dans le SQL Editor de Supabase
-- APRÈS migration.sql
-- ============================================

-- ============================================
-- TABLE: user_book_access
-- ============================================
CREATE TABLE user_book_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL = accès illimité
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, book_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_book_access_user_id ON user_book_access(user_id);
CREATE INDEX idx_user_book_access_book_id ON user_book_access(book_id);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE user_book_access ENABLE ROW LEVEL SECURITY;

-- SELECT: user voit ses accès, admin voit tout
CREATE POLICY "user_book_access_select" ON user_book_access
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- INSERT: admin seulement
CREATE POLICY "user_book_access_insert" ON user_book_access
  FOR INSERT WITH CHECK (is_admin());

-- UPDATE: admin seulement
CREATE POLICY "user_book_access_update" ON user_book_access
  FOR UPDATE USING (is_admin());

-- DELETE: admin seulement
CREATE POLICY "user_book_access_delete" ON user_book_access
  FOR DELETE USING (is_admin());

-- ============================================
-- POLICY: admin peut INSERT user_profiles
-- (nécessaire pour le trigger handle_new_user
-- quand l'admin crée un utilisateur)
-- ============================================
CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT WITH CHECK (true);
-- Le trigger handle_new_user s'exécute en SECURITY DEFINER,
-- donc cette policy est permissive car l'insert vient du trigger.

-- ============================================
-- STORAGE: Modifier policy book_pdfs_select
-- Seuls les users avec accès actif (ou admins) peuvent lire les PDFs
-- ============================================
-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "book_pdfs_select" ON storage.objects;

-- Nouvelle policy : accès conditionnel
CREATE POLICY "book_pdfs_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'book-pdfs'
    AND (
      is_admin()
      OR EXISTS (
        SELECT 1 FROM user_book_access uba
        JOIN books b ON b.id = uba.book_id
        WHERE uba.user_id = auth.uid()
          AND b.pdf_url = storage.objects.name
          AND (uba.expires_at IS NULL OR uba.expires_at > now())
      )
    )
  );
