# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured yet.

## Architecture

React 19 + Vite app for a general-purpose book library. Client-side only — all data lives in IndexedDB and localStorage. The codebase is written in French (comments, variable names in some places, UI text).

### Layer structure

- **`pages/`** — Route-level components. Admin pages are in `pages/admin/`.
- **`components/ui/`** — Generic reusable components (Button, Card, Badge) with no business logic.
- **`components/shared/`** — Domain components (BookCard, CategoryBadge, ProtectedRoute).
- **`components/layouts/`** — Layout wrappers (AdminLayout).
- **`hooks/`** — `useBooks` (book CRUD, filtering, search, progress) and `useCategories` (category data + helpers). These are the primary state management layer.
- **`services/`** — Data access: `libraryService.js` (IndexedDB), `authService.js` (localStorage auth), `bookService.js`, `readingProgressService.js`. All designed for future migration to REST API.
- **`config/`** — `theme.js` (design tokens: colors, spacing, shadows, font sizes), `categories.json`, `books.json`, `users.json`, `readingProgress.json`.
- **`utils/`** — `constants.js` (routes, messages, DB config, validation rules, pagination) and `formatters.js` (date/size/currency formatting, locale is French/FCFA).
- **`context/`** — `AuthContext.jsx` provides global auth state via React Context + `useAuth` hook.

### Routing

Public: `/`, `/login`, `/register`, `/catalog`, `/library`, `/book/:id`
Protected (requires auth): `/reader/:id`, `/my-books`, `/profile`, `/profile/edit`
Admin-only: `/admin/*` (dashboard, books, add-book, categories)

Auth guard is `ProtectedRoute` component wrapping protected routes in `App.jsx`.

### Key patterns

- All components use PropTypes for prop validation.
- Design tokens from `config/theme.js` are used inline (not CSS variables).
- Constants (routes, messages, DB config) are centralized in `utils/constants.js` — use these instead of string literals.
- Services are abstraction-ready: IndexedDB calls are isolated so they can be swapped to API calls. Migration points are marked with TODO comments.
- Bootstrap 5 is used for layout/grid; custom styling uses theme tokens.

## Code conventions

- Components: PascalCase filenames (`BookCard.jsx`)
- Hooks: `use` prefix, camelCase (`useBooks.js`)
- Constants: UPPER_SNAKE_CASE
- Import order: React → libraries → components → hooks → utils
