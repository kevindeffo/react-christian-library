# Guide complet : Configuration Supabase pour BiblioHub

Ce guide explique **chaque etape** pour configurer Supabase depuis zero.

---

## Table des matieres

1. [Creer le projet Supabase](#1-creer-le-projet-supabase)
2. [Comprendre les cles et le mot de passe](#2-comprendre-les-cles-et-le-mot-de-passe)
3. [Recuperer l'URL et la cle anon](#3-recuperer-lurl-et-la-cle-anon)
4. [Configurer le fichier .env](#4-configurer-le-fichier-env)
5. [Executer le SQL de migration](#5-executer-le-sql-de-migration)
6. [Verifier les tables creees](#6-verifier-les-tables-creees)
7. [Verifier les Storage Buckets](#7-verifier-les-storage-buckets)
8. [Desactiver la confirmation email](#8-desactiver-la-confirmation-email)
9. [Creer les utilisateurs de test](#9-creer-les-utilisateurs-de-test)
10. [Promouvoir l'admin](#10-promouvoir-ladmin)
11. [Verification finale](#11-verification-finale)
12. [Annexe : Schema de la base](#annexe--schema-de-la-base)

---

## 1. Creer le projet Supabase

1. Aller sur **https://supabase.com** et se connecter (ou creer un compte avec GitHub/email)
2. Cliquer sur **"New Project"**
3. Remplir le formulaire :
   - **Organization** : choisir ton organisation (ou en creer une)
   - **Name** : `bibliohub` (ou ce que tu veux)
   - **Database Password** : choisir un mot de passe fort (voir section suivante)
   - **Region** : choisir la region la plus proche (ex: `West EU (Ireland)` pour l'Afrique de l'Ouest)
   - **Pricing Plan** : Free tier suffit
4. Cliquer **"Create new project"**
5. Attendre 1-2 minutes que le projet se cree (barre de chargement)

---

## 2. Comprendre les cles et le mot de passe

Supabase te donne **3 choses differentes**. Ne les confonds pas :

### Le mot de passe de la base de donnees (Database Password)

- C'est celui que tu as choisi a la creation du projet
- Il sert a **se connecter directement a PostgreSQL** (avec pgAdmin, DBeaver, ou la ligne de commande `psql`)
- **Tu n'en as PAS besoin dans l'app React**
- Garde-le dans un endroit sur au cas ou tu veux te connecter directement a la DB plus tard
- Ou le retrouver : `Settings > Database > Database password` (tu peux le reset)

### La cle `anon` (anon key)

- C'est une cle **publique** destinee a etre utilisee cote client (navigateur)
- Elle permet d'appeler l'API Supabase **avec les restrictions RLS** (Row Level Security)
- Un utilisateur ne peut voir/modifier QUE ce que les policies autorisent
- **C'est celle qu'on met dans le `.env` de l'app React**
- **Securite** : meme si quelqu'un la voit dans le code source du navigateur, il ne peut rien faire de plus que ce que RLS autorise

### La cle `service_role` (secret)

- C'est une cle **privee/admin** qui **bypass toutes les regles RLS**
- **NE JAMAIS la mettre dans le code frontend**
- Elle sert pour des scripts serveur, des migrations, ou des taches admin
- **Tu n'en as pas besoin pour cette app**

---

## 3. Recuperer l'URL et la cle anon

1. Dans le dashboard Supabase, va dans le **menu de gauche**
2. Clique sur l'icone **engrenage** en bas (ou **"Project Settings"**)
3. Dans le sous-menu, clique sur **"API"** (sous la section "Configuration")
4. Tu verras :

| Champ | Ou c'est | Exemple |
|-------|----------|---------|
| **Project URL** | Tout en haut, section "Project URL" | `https://abcdefghij.supabase.co` |
| **anon public** | Section "Project API keys", la premiere cle | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (longue chaine) |
| **service_role** | Section "Project API keys", la deuxieme cle (cachee) | Ne pas toucher |

5. Copie le **Project URL** et la cle **anon public**

---

## 4. Configurer le fichier .env

Ouvre le fichier `.env` a la racine du projet et remplace les valeurs :

```
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

- Remplace `abcdefghij` par ton vrai sous-domaine
- Colle ta vraie cle anon (elle fait environ 200+ caracteres)
- **Ne commite JAMAIS ce fichier** (il est dans `.gitignore`)

---

## 5. Executer le SQL de migration

C'est l'etape principale. Le fichier `supabase/migration.sql` contient TOUT : tables, triggers, indexes, policies, buckets, et donnees initiales.

### Methode : SQL Editor

1. Dans le dashboard Supabase, menu de gauche, clique sur **"SQL Editor"** (icone `>_`)
2. Clique sur **"New query"** (bouton en haut a droite)
3. **Copie-colle l'INTEGRALITE** du fichier `supabase/migration.sql` dans l'editeur
4. Clique sur **"Run"** (bouton vert en bas a droite, ou `Ctrl+Enter`)
5. Tu dois voir en bas : **"Success. No rows returned"** (c'est normal, ce sont des CREATE/INSERT)

### En cas d'erreur

- Si tu vois `relation "categories" already exists` : tu as deja execute le script. Ce n'est pas grave.
- Si tu veux repartir de zero : execute d'abord ceci dans le SQL Editor pour tout supprimer :

```sql
DROP TABLE IF EXISTS reading_progress CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS is_admin CASCADE;

DELETE FROM storage.buckets WHERE id IN ('book-pdfs', 'book-covers');
```

Puis re-execute le `migration.sql`.

---

## 6. Verifier les tables creees

Apres avoir execute le SQL, verifie que tout est bien en place.

### 6.1 Voir les tables

1. Menu de gauche > **"Table Editor"** (icone tableau)
2. Tu dois voir **4 tables** :

| Table | Description | Nb de lignes attendues |
|-------|------------|----------------------|
| `user_profiles` | Profils utilisateurs (lie a auth.users) | 0 (vide pour l'instant) |
| `categories` | Les 12 categories de livres | **12 lignes** |
| `books` | Les livres de la bibliotheque | 0 (vide) |
| `reading_progress` | Progression de lecture par user/book | 0 (vide) |

3. Clique sur **`categories`** pour verifier : tu dois voir les 12 categories (fiction, scifi-fantasy, christian, etc.)

### 6.2 Detail de chaque table

#### `user_profiles`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Meme UUID que `auth.users`, lie par foreign key |
| `name` | TEXT | Nom affiche de l'utilisateur |
| `role` | TEXT | `'user'` ou `'admin'` (check constraint) |
| `created_at` | TIMESTAMPTZ | Date de creation |
| `updated_at` | TIMESTAMPTZ | Mis a jour automatiquement par trigger |

#### `categories`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT (PK) | Identifiant unique (ex: `'fiction'`, `'christian'`) |
| `name` | TEXT | Nom affiche (ex: `'Roman & Fiction'`) |
| `color` | TEXT | Couleur hex (ex: `'#8b5cf6'`) |
| `icon` | TEXT | Emoji (ex: `'📖'`) |
| `description` | TEXT | Description de la categorie |
| `created_at` | TIMESTAMPTZ | Date de creation |
| `updated_at` | TIMESTAMPTZ | Auto-update par trigger |

#### `books`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Genere automatiquement (`uuid_generate_v4()`) |
| `name` | TEXT | Titre du livre |
| `author` | TEXT | Nom de l'auteur |
| `description` | TEXT | Description du livre |
| `category` | TEXT (FK) | Reference `categories(id)` |
| `pdf_url` | TEXT | Chemin du PDF dans Supabase Storage (ex: `pdfs/abc-123.pdf`) |
| `cover_url` | TEXT | Chemin de la couverture (si applicable) |
| `pdf_size` | BIGINT | Taille du PDF en octets |
| `total_pages` | INTEGER | Nombre de pages |
| `price` | NUMERIC(10,2) | Prix en FCFA (0 = gratuit) |
| `created_by` | UUID (FK) | Reference `auth.users(id)` |
| `created_at` | TIMESTAMPTZ | Date d'ajout |
| `updated_at` | TIMESTAMPTZ | Auto-update par trigger |
| `search_vector` | tsvector | **Colonne generee** automatiquement pour la recherche full-text (francais) |

#### `reading_progress`
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID (PK) | Genere automatiquement |
| `user_id` | UUID (FK) | Reference `auth.users(id)`, CASCADE delete |
| `book_id` | UUID (FK) | Reference `books(id)`, CASCADE delete |
| `current_page` | INTEGER | Page actuelle |
| `total_pages` | INTEGER | Nombre total de pages |
| `progress` | INTEGER | **Colonne generee** : `(current_page * 100) / total_pages` |
| `last_read_at` | TIMESTAMPTZ | Date de derniere lecture |
| | UNIQUE | Contrainte `(user_id, book_id)` - un seul enregistrement par user/livre |

### 6.3 Verifier les RLS (Row Level Security)

1. Menu de gauche > **"Authentication"** > onglet **"Policies"**
2. OU : dans le Table Editor, clique sur une table > onglet **"RLS Policies"**
3. Tu dois voir que **RLS est active** (enabled) sur les 4 tables
4. Chaque table a ses policies :

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `categories` | Tout le monde | Admins | Admins | Admins |
| `books` | Tout le monde | Admins | Admins | Admins |
| `reading_progress` | Propre user + admins | Propre user | Propre user | Propre user |
| `user_profiles` | Propre profil + admins | - | Propre profil | - |

### 6.4 Verifier les triggers et fonctions

1. Va dans **SQL Editor**
2. Execute :

```sql
-- Verifier les fonctions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

Tu dois voir :
- `update_updated_at_column` (auto-update des dates)
- `handle_new_user` (cree un user_profile a l'inscription)
- `is_admin` (helper pour les policies RLS)

### 6.5 Verifier les indexes

Execute dans le SQL Editor :

```sql
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public' ORDER BY tablename;
```

Tu dois voir au minimum :
- `idx_books_category`
- `idx_books_created_at`
- `idx_books_search_vector`
- `idx_reading_progress_user_id`
- `idx_reading_progress_book_id`
- `idx_reading_progress_last_read`

---

## 7. Verifier les Storage Buckets

Les buckets sont crees par le SQL de migration. Verifions :

1. Menu de gauche > **"Storage"** (icone dossier)
2. Tu dois voir **2 buckets** :

| Bucket | Public ? | Description |
|--------|----------|-------------|
| `book-pdfs` | Non (prive) | Stocke les fichiers PDF des livres |
| `book-covers` | Oui (public) | Stocke les images de couverture |

### Si les buckets n'apparaissent pas

Cree-les manuellement :

1. Clique **"New bucket"**
2. Pour le premier :
   - Name : `book-pdfs`
   - **Decoche** "Public bucket" (doit etre prive)
   - Clique "Create bucket"
3. Pour le deuxieme :
   - Name : `book-covers`
   - **Coche** "Public bucket"
   - Clique "Create bucket"

### Verifier les policies de storage

1. Clique sur le bucket `book-pdfs`
2. Va dans l'onglet **"Policies"** (ou "Configuration")
3. Tu dois voir 4 policies :
   - `book_pdfs_select` : les utilisateurs connectes peuvent lire
   - `book_pdfs_insert` : seuls les admins peuvent uploader
   - `book_pdfs_update` : seuls les admins peuvent modifier
   - `book_pdfs_delete` : seuls les admins peuvent supprimer

Si les policies n'existent pas, re-execute uniquement la partie Storage du SQL :

```sql
-- Policies pour book-pdfs
CREATE POLICY "book_pdfs_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "book_pdfs_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'book-pdfs' AND is_admin());

CREATE POLICY "book_pdfs_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'book-pdfs' AND is_admin());

CREATE POLICY "book_pdfs_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'book-pdfs' AND is_admin());

-- Policies pour book-covers
CREATE POLICY "book_covers_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND is_admin());

CREATE POLICY "book_covers_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'book-covers' AND is_admin());

CREATE POLICY "book_covers_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'book-covers' AND is_admin());
```

---

## 8. Desactiver la confirmation email

Par defaut, Supabase envoie un email de confirmation a l'inscription. En developpement, c'est genial mais ca bloque les tests. Desactive-le :

1. Menu de gauche > **"Authentication"** (icone cadenas)
2. Onglet **"Providers"** dans le sous-menu de gauche
3. Clique sur **"Email"**
4. **Decoche** l'option **"Confirm email"** (toggle off)
5. Clique **"Save"**

> **Important** : Reactive cette option avant de passer en production !

---

## 9. Creer les utilisateurs de test

Maintenant on cree les 2 utilisateurs de base (un admin et un user normal).

### Methode 1 : Via le Dashboard (recommande)

1. Menu de gauche > **"Authentication"** > onglet **"Users"**
2. Clique **"Add user"** > **"Create new user"**
3. Premier utilisateur (admin) :
   - Email : `admin@booklib.com`
   - Password : `admin123`
   - Coche **"Auto Confirm User"**
   - Clique **"Create user"**
4. Deuxieme utilisateur (normal) :
   - Email : `user@booklib.com`
   - Password : `user123`
   - Coche **"Auto Confirm User"**
   - Clique **"Create user"**

### Methode 2 : Via le SQL Editor

```sql
-- NOTE : La creation d'utilisateurs auth se fait normalement via l'API ou le Dashboard.
-- Utilise la Methode 1 ci-dessus.
```

### Verifier la creation

1. Apres avoir cree les users, verifie dans **"Authentication" > "Users"** que les 2 apparaissent
2. Verifie dans **"Table Editor" > `user_profiles`** que les 2 profils ont ete crees automatiquement (grace au trigger `handle_new_user`)
3. Tu verras que les 2 ont `role = 'user'` : c'est normal, on va promouvoir l'admin a l'etape suivante

---

## 10. Promouvoir l'admin

Le trigger cree tous les users avec `role = 'user'`. Il faut manuellement passer le premier en admin.

### Etape 1 : Trouver le UUID de l'admin

1. Va dans **"Authentication" > "Users"**
2. Trouve la ligne `admin@booklib.com`
3. **Copie son UUID** (la longue chaine dans la colonne "User UID", ex: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Etape 2 : Mettre a jour le role

1. Va dans **"SQL Editor"**
2. Execute (en remplacant le UUID) :

```sql
UPDATE user_profiles
SET role = 'admin'
WHERE id = '644087e8-1e8a-4e6a-9d18-0c022ce52d4e';
```

Par exemple :
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

3. Tu peux aussi le faire via le **Table Editor** :
   - Ouvre `user_profiles`
   - Clique sur la cellule `role` de l'admin
   - Change `user` en `admin`
   - Appuie sur Entree pour sauvegarder

### Verifier

Dans le Table Editor > `user_profiles` :

| id | name | role |
|----|------|------|
| uuid-admin... | Utilisateur | **admin** |
| uuid-user... | Utilisateur | user |

---

## 11. Verification finale

### 11.1 Lancer l'app

```bash
npm run dev
```

L'app doit demarrer sur `http://localhost:5173` sans erreurs dans la console.

### 11.2 Tester le flow complet

| Test | Comment verifier |
|------|-----------------|
| **Inscription** | S'inscrire avec un nouvel email > verifier que `user_profiles` a une nouvelle ligne |
| **Connexion** | Se connecter avec `admin@booklib.com` / `admin123` |
| **Catalogue** | Aller sur `/catalog` > les livres se chargent depuis PostgreSQL (vide au debut) |
| **Ajout livre (admin)** | Aller sur `/admin/add-book` > uploader un PDF > verifier dans `books` et dans Storage `book-pdfs` |
| **Lecture** | Ouvrir un livre > le PDF se charge via une signed URL depuis Storage |
| **Progression** | Changer de page > verifier que `reading_progress` a une nouvelle ligne |
| **Suppression** | Supprimer un livre en admin > verifier que la ligne et le fichier Storage sont supprimes |
| **Deconnexion** | Se deconnecter > verifier qu'on ne peut plus acceder aux pages protegees |

### 11.3 Verifier dans Supabase

Apres les tests, verifie dans le Dashboard :

1. **Table Editor > `books`** : les livres ajoutes apparaissent
2. **Table Editor > `reading_progress`** : les progressions sont enregistrees
3. **Storage > `book-pdfs`** : les fichiers PDF sont uploades dans le dossier `pdfs/`

### 11.4 Tester le RLS

1. Connecte-toi avec `user@booklib.com` (role: user)
2. Essaie d'aller sur `/admin/add-book` : le `ProtectedRoute` doit bloquer l'acces
3. Meme si quelqu'un bypass l'UI, Supabase **refusera** l'insert/delete cote serveur grace au RLS

---

## Annexe : Schema de la base

```
auth.users (gere par Supabase)
    |
    |-- 1:1 --> user_profiles (id = auth.users.id)
    |                |
    |                |-- role: 'user' | 'admin'
    |
    |-- 1:N --> books (created_by = auth.users.id)
    |              |
    |              |-- category --> categories(id)
    |              |-- pdf_url --> Storage: book-pdfs/pdfs/xxx.pdf
    |              |-- search_vector (auto-genere, recherche full-text francais)
    |
    |-- 1:N --> reading_progress (user_id = auth.users.id)
                   |
                   |-- book_id --> books(id) ON DELETE CASCADE
                   |-- progress (auto-calcule: current_page/total_pages * 100)
                   |-- UNIQUE(user_id, book_id)


categories (12 lignes pre-remplies)
    |
    |-- id: 'fiction', 'christian', 'biography', etc.
    |-- Referencee par books.category


Storage Buckets:
    |
    |-- book-pdfs (prive) : fichiers PDF, acces en lecture pour users connectes
    |-- book-covers (public) : images de couverture
```

### Colonnes generees automatiquement

Ces colonnes sont calculees par PostgreSQL, **tu ne peux pas les modifier manuellement** :

1. **`books.search_vector`** : index de recherche full-text en francais, genere a partir de `name`, `author`, et `description`
2. **`reading_progress.progress`** : pourcentage de progression, calcule comme `(current_page * 100) / total_pages`

### Triggers automatiques

1. **`update_updated_at_column`** : met a jour `updated_at` a chaque modification sur `user_profiles`, `categories`, et `books`
2. **`handle_new_user`** : cree automatiquement une ligne dans `user_profiles` quand un utilisateur s'inscrit via Supabase Auth

---

## Resume des etapes

```
1. Creer le projet sur supabase.com
2. Copier l'URL + anon key depuis Settings > API
3. Les coller dans le fichier .env
4. Executer migration.sql dans le SQL Editor
5. Desactiver "Confirm email" dans Authentication > Providers > Email
6. Creer 2 utilisateurs dans Authentication > Users
7. Passer l'admin en role 'admin' dans la table user_profiles
8. npm run dev et tester
```
