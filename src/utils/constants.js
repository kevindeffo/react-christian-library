/**
 * Application constants
 * Centralized constants to avoid magic strings/numbers
 */

// Database configuration
export const DB_CONFIG = {
  NAME: 'BookReaderDB',
  VERSION: 2,
  STORE_NAME: 'books',
};

// Routes
export const ROUTES = {
  // Public routes
  HOME: '/',
  CATALOG: '/catalog',
  LIBRARY: '/library',
  READER: '/reader',
  LOGIN: '/login',
  REGISTER: '/register',
  BOOK_DETAILS: '/book',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BOOKS: '/admin/books',
  ADMIN_ADD_BOOK: '/admin/add-book',
  ADMIN_CATEGORIES: '/admin/categories',
};

// File types
export const FILE_TYPES = {
  PDF: 'application/pdf',
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  MAX_BOOK_SIZE: 100 * 1024 * 1024, // 100 MB
  WARNING_SIZE: 50 * 1024 * 1024,   // 50 MB
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  BOOKS_PER_PAGE: 12,
  RECENT_BOOKS_COUNT: 5,
  TOP_CATEGORIES_COUNT: 5,
};

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  LAST_VIEWED_BOOK: 'last_viewed_book',
  THEME: 'theme_preference',
  USER_SESSION: 'user_session',
};

// Book default values
export const BOOK_DEFAULTS = {
  CURRENT_PAGE: 1,
  DEFAULT_ZOOM: 100,
  MIN_ZOOM: 60,
  MAX_ZOOM: 200,
  ZOOM_STEP: 10,
};

// Messages
export const MESSAGES = {
  // Success messages
  BOOK_ADDED_SUCCESS: 'Livre publié avec succès!',
  BOOK_DELETED_SUCCESS: 'Livre supprimé avec succès',
  BOOK_UPDATED_SUCCESS: 'Livre mis à jour avec succès',

  // Error messages
  BOOK_ADD_ERROR: 'Erreur lors de la publication du livre',
  BOOK_DELETE_ERROR: 'Erreur lors de la suppression du livre',
  BOOK_LOAD_ERROR: 'Erreur lors du chargement du livre',
  INVALID_FILE_TYPE: 'Veuillez sélectionner un fichier PDF',
  MISSING_REQUIRED_FIELDS: 'Veuillez remplir tous les champs obligatoires',

  // Confirmation messages
  CONFIRM_DELETE_BOOK: 'Êtes-vous sûr de vouloir supprimer ce livre ?',

  // Info messages
  NO_BOOKS: 'Aucun livre dans la bibliothèque',
  NO_BOOKS_FOUND: 'Aucun livre trouvé avec ces critères',
  EMPTY_CATALOG: 'Votre bibliothèque est vide',
};

// Status
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Category filter
export const CATEGORY_FILTER = {
  ALL: 'all',
};

// Validation rules
export const VALIDATION = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 200,
  MIN_AUTHOR_LENGTH: 1,
  MAX_AUTHOR_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_PRICE: 0,
};

// Animation durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

export default {
  DB_CONFIG,
  ROUTES,
  FILE_TYPES,
  FILE_SIZE_LIMITS,
  PAGINATION,
  STORAGE_KEYS,
  BOOK_DEFAULTS,
  MESSAGES,
  STATUS,
  CATEGORY_FILTER,
  VALIDATION,
  ANIMATION,
};
