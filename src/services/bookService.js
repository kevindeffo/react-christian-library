/**
 * Book Service
 * Manages books from JSON storage
 * TODO: Replace with API calls when backend is ready
 */

import booksData from '../config/books.json';

const BOOKS_STORAGE_KEY = 'app_books';

/**
 * Initialize books in localStorage from JSON
 */
const initializeBooks = () => {
  const existingBooks = localStorage.getItem(BOOKS_STORAGE_KEY);
  if (!existingBooks) {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(booksData));
  }
};

/**
 * Get all books
 * @returns {Promise<Array>} List of books
 */
export const getAllBooks = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  initializeBooks();
  const books = localStorage.getItem(BOOKS_STORAGE_KEY);
  return books ? JSON.parse(books) : [];
};

/**
 * Get book by ID
 * @param {number} bookId - Book ID
 * @returns {Promise<object|null>} Book object or null
 */
export const getBookById = async (bookId) => {
  const books = await getAllBooks();
  return books.find(book => book.id === bookId) || null;
};

/**
 * Get books by category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} Filtered books
 */
export const getBooksByCategory = async (categoryId) => {
  const books = await getAllBooks();
  return books.filter(book => book.category === categoryId);
};

/**
 * Search books
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered books
 */
export const searchBooks = async (query) => {
  const books = await getAllBooks();
  if (!query || !query.trim()) return books;

  const lowerQuery = query.toLowerCase();
  return books.filter(book =>
    book.name.toLowerCase().includes(lowerQuery) ||
    book.author.toLowerCase().includes(lowerQuery) ||
    book.description.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Add new book (Admin only)
 * @param {object} bookData - Book data
 * @returns {Promise<object>} Created book
 */
export const addBook = async (bookData) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const books = await getAllBooks();

  const newBook = {
    id: Math.max(...books.map(b => b.id), 0) + 1,
    name: bookData.name,
    author: bookData.author,
    description: bookData.description || '',
    category: bookData.category,
    pdfUrl: bookData.pdfUrl || '',
    coverUrl: bookData.coverUrl || '',
    size: bookData.size || 0,
    totalPages: bookData.totalPages || 0,
    addedDate: new Date().toISOString(),
    price: bookData.price || 0
  };

  books.push(newBook);
  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));

  return newBook;
};

/**
 * Update book (Admin only)
 * @param {number} bookId - Book ID
 * @param {object} updates - Book updates
 * @returns {Promise<object>} Updated book
 */
export const updateBook = async (bookId, updates) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const books = await getAllBooks();
  const index = books.findIndex(book => book.id === bookId);

  if (index === -1) {
    throw new Error('Livre non trouvé');
  }

  books[index] = {
    ...books[index],
    ...updates,
    id: bookId, // Don't allow ID change
  };

  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));

  return books[index];
};

/**
 * Delete book (Admin only)
 * @param {number} bookId - Book ID
 * @returns {Promise<void>}
 */
export const deleteBook = async (bookId) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const books = await getAllBooks();
  const filtered = books.filter(book => book.id !== bookId);

  localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Get book statistics
 * @returns {Promise<object>} Book statistics
 */
export const getBookStats = async () => {
  const books = await getAllBooks();

  const totalBooks = books.length;
  const totalSize = books.reduce((sum, book) => sum + book.size, 0);
  const categoryCounts = {};

  books.forEach(book => {
    categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
  });

  return {
    totalBooks,
    totalSize,
    categoryCounts,
    averageSize: totalBooks > 0 ? Math.round(totalSize / totalBooks) : 0
  };
};

export default {
  getAllBooks,
  getBookById,
  getBooksByCategory,
  searchBooks,
  addBook,
  updateBook,
  deleteBook,
  getBookStats,
};
