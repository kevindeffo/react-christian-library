# Architecture du Projet - BiblioHub

## 📁 Structure des Dossiers

```
src/
├── components/           # Composants React réutilisables
│   ├── layouts/         # Layouts de l'application
│   │   └── AdminLayout.jsx
│   ├── shared/          # Composants métier partagés
│   │   ├── BookCard.jsx
│   │   └── CategoryBadge.jsx
│   └── ui/              # Composants UI de base
│       ├── Badge.jsx
│       ├── Button.jsx
│       └── Card.jsx
│
├── config/              # Configuration de l'application
│   ├── categories.json  # Données des catégories (JSON)
│   └── theme.js         # Thème et design tokens
│
├── context/             # Context API (pour état global futur)
│
├── hooks/               # Hooks React personnalisés
│   ├── useBooks.js      # Gestion des livres
│   └── useCategories.js # Gestion des catégories
│
├── pages/               # Pages de l'application
│   ├── admin/          # Pages d'administration
│   │   ├── AddBookPage.jsx
│   │   ├── BooksManagementPage.jsx
│   │   ├── CategoriesManagementPage.jsx
│   │   └── DashboardPage.jsx
│   ├── CatalogPage.jsx  # Catalogue utilisateur
│   ├── LandingPage.jsx  # Page d'accueil
│   └── ReaderPage.jsx   # Lecteur PDF
│
├── services/            # Services métier
│   └── libraryService.js # Service IndexedDB (API future)
│
├── styles/              # Styles globaux
│
└── utils/               # Fonctions utilitaires
    ├── constants.js     # Constantes de l'application
    └── formatters.js    # Fonctions de formatage
```

## 🏗️ Principes d'Architecture

### 1. Séparation des Préoccupations
- **Composants UI (`components/ui/`)**: Composants de base réutilisables, sans logique métier
- **Composants Shared (`components/shared/`)**: Composants métier spécifiques au domaine
- **Pages (`pages/`)**: Composition de composants pour former des pages
- **Services (`services/`)**: Logique métier et accès aux données
- **Hooks (`hooks/`)**: Logique réutilisable avec gestion d'état
- **Utils (`utils/`)**: Fonctions utilitaires pures

### 2. Configuration Centralisée
- **Theme (`config/theme.js`)**: Couleurs, espacements, tailles centralisées
- **Constants (`utils/constants.js`)**: Constantes pour éviter les "magic strings/numbers"
- **Categories (`config/categories.json`)**: Données des catégories externalisées

### 3. Réutilisabilité
- Composants UI génériques et réutilisables
- Hooks personnalisés pour partager la logique
- Fonctions utilitaires pour éviter la duplication de code

## 🔄 Migration Future vers API

### État Actuel
- **Stockage**: IndexedDB (côté client)
- **Catégories**: Fichier JSON statique
- **Services**: `libraryService.js` pour gérer IndexedDB

### Migration Prévue
Tous les services sont conçus pour faciliter la migration:

1. **Categories**:
   ```javascript
   // Actuel (config/categories.json)
   import categoriesData from '../config/categories.json';

   // Future (API)
   const response = await fetch('/api/categories');
   const categoriesData = await response.json();
   ```

2. **Books**:
   ```javascript
   // Actuel (IndexedDB)
   import { getAllBooks } from '../services/libraryService';

   // Future (API)
   import { getAllBooks } from '../services/api/bookService';
   // L'interface reste identique, seule l'implémentation change
   ```

### Points de Migration Identifiés

#### 📌 `src/hooks/useCategories.js`
```javascript
// TODO: Remplacer par appel API
const loadCategories = async () => {
  // Remplacer cette ligne:
  setCategories(categoriesData);

  // Par:
  const response = await fetch('/api/categories');
  const data = await response.json();
  setCategories(data);
};
```

#### 📌 `src/services/libraryService.js`
```javascript
// TODO: Migrer vers une API REST quand le backend sera prêt
// Tous les exports (getAllBooks, addBookToLibrary, etc.)
// devront être remplacés par des appels HTTP
```

#### 📌 `src/hooks/useBooks.js`
```javascript
// L'interface reste identique, seule l'implémentation change
// Les composants n'auront PAS besoin d'être modifiés
```

## 📦 Composants Disponibles

### UI Components

#### Button
```jsx
import Button from '../components/ui/Button';

<Button
  variant="primary"
  size="lg"
  icon="➕"
  loading={saving}
  onClick={handleClick}
>
  Ajouter
</Button>
```

Variants: `primary`, `secondary`, `success`, `danger`, `outline`, `ghost`
Sizes: `sm`, `md`, `lg`

#### Card
```jsx
import Card from '../components/ui/Card';

<Card shadow="lg" padding="xl" hoverable>
  Contenu
</Card>
```

#### Badge
```jsx
import Badge from '../components/ui/Badge';

<Badge color="#8b5cf6" size="md">
  Nouveau
</Badge>
```

### Shared Components

#### CategoryBadge
```jsx
import CategoryBadge from '../components/shared/CategoryBadge';

<CategoryBadge
  categoryId="fiction"
  showIcon={true}
  showName={true}
  size="md"
/>
```

#### BookCard
```jsx
import BookCard from '../components/shared/BookCard';

<BookCard
  book={bookData}
  onOpen={handleOpen}
  onDelete={handleDelete}
  showActions={true}
/>
```

## 🎣 Hooks Disponibles

### useCategories
```jsx
import { useCategories } from '../hooks/useCategories';

const {
  categories,           // Liste complète
  loading,             // État de chargement
  getCategoryById,     // Obtenir une catégorie
  getCategoryName,     // Obtenir le nom
  getCategoryColor,    // Obtenir la couleur
  categoryOptions,     // Options pour <select>
} = useCategories();
```

### useBooks
```jsx
import { useBooks } from '../hooks/useBooks';

const {
  books,               // Liste des livres
  loading,            // État de chargement
  loadBooks,          // Recharger
  addBook,            // Ajouter
  removeBook,         // Supprimer
  updateProgress,     // Mettre à jour progression
  filterByCategory,   // Filtrer
  searchBooks,        // Rechercher
  getRecentBooks,     // Récents
} = useBooks();
```

## 🛠️ Utilitaires Disponibles

### Formatters
```javascript
import {
  formatDate,         // Date en français
  formatDateTime,     // Date avec heure
  formatSize,         // Taille fichier
  formatCurrency,     // Monnaie (FCFA)
  formatPercentage,   // Pourcentage
} from '../utils/formatters';

formatDate('2024-01-15');           // "15/01/2024"
formatSize(1048576);                // "1 MB"
formatCurrency(5000);               // "5 000 FCFA"
```

### Constants
```javascript
import {
  ROUTES,            // Routes de l'app
  MESSAGES,          // Messages utilisateur
  DB_CONFIG,         // Config base de données
  BOOK_DEFAULTS,     // Valeurs par défaut
} from '../utils/constants';

navigate(ROUTES.ADMIN_DASHBOARD);
alert(MESSAGES.BOOK_ADDED_SUCCESS);
```

### Theme
```javascript
import { colors, spacing, borderRadius } from '../config/theme';

const style = {
  backgroundColor: colors.primary,
  padding: spacing.lg,
  borderRadius: borderRadius.lg,
};
```

## 🔐 Gestion d'État Future

Pour l'instant, l'état est géré localement dans chaque page.
Quand l'authentification sera ajoutée, utilisez le dossier `context/`:

```javascript
// Exemple futur
src/context/
├── AuthContext.jsx    // Authentification
├── BookContext.jsx    // État global des livres
└── ThemeContext.jsx   // Préférences utilisateur
```

## 📝 Conventions de Code

1. **Nommage**:
   - Composants: PascalCase (`BookCard.jsx`)
   - Hooks: camelCase avec préfixe `use` (`useBooks.js`)
   - Utilitaires: camelCase (`formatters.js`)
   - Constantes: UPPER_SNAKE_CASE (`DB_NAME`)

2. **Imports**:
   - Imports absolus depuis `src/`
   - Ordre: React → Librairies → Composants → Hooks → Utils

3. **PropTypes**:
   - Toujours définir PropTypes pour les composants
   - Documenter les props complexes

4. **Commentaires**:
   - JSDoc pour les fonctions publiques
   - TODO pour les migrations futures
   - Commentaires explicatifs pour la logique complexe

## 🚀 Prochaines Étapes

### Court Terme
- [ ] Ajouter authentification utilisateur
- [ ] Implémenter système de paiement
- [ ] Créer page de détails de livre
- [ ] Ajouter upload de couvertures

### Moyen Terme
- [ ] Migrer vers API REST
- [ ] Ajouter base de données backend
- [ ] Implémenter gestion des utilisateurs
- [ ] Ajouter analytics et statistiques

### Long Terme
- [ ] Application mobile (React Native)
- [ ] Synchronisation multi-appareils
- [ ] Système de recommandations
- [ ] Fonctionnalités sociales (avis, notes)

## 📚 Documentation Additionnelle

- `README.md` - Installation et démarrage
- `package.json` - Dépendances et scripts
- Commentaires inline dans le code
