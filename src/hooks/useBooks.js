import { useState, useEffect, useCallback } from 'react';
import {
  getAllBooks,
  addBookToLibrary,
  deleteBook,
  updateBookProgress,
  getBookById,
} from '../services/libraryService';
import { STATUS, MESSAGES } from '../utils/constants';

/**
 * Custom hook to manage books
 * Provides books data and CRUD operations
 * In the future, this will use API instead of IndexedDB
 */
export const useBooks = (autoLoad = true) => {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);

  const loading = status === STATUS.LOADING;

  /**
   * Load all books from storage
   */
  const loadBooks = useCallback(async () => {
    try {
      setStatus(STATUS.LOADING);
      setError(null);
      const allBooks = await getAllBooks();
      setBooks(allBooks);
      setStatus(STATUS.SUCCESS);
      return allBooks;
    } catch (err) {
      console.error('Error loading books:', err);
      setError(MESSAGES.BOOK_LOAD_ERROR);
      setStatus(STATUS.ERROR);
      return [];
    }
  }, []);

  /**
   * Add a new book
   * @param {File} file - PDF file
   * @param {string} category - Category ID
   * @returns {Promise<number>} Book ID
   */
  const addBook = useCallback(async (file, category) => {
    try {
      setStatus(STATUS.LOADING);
      setError(null);
      const bookId = await addBookToLibrary(file, category);
      await loadBooks(); // Reload books after adding
      setStatus(STATUS.SUCCESS);
      return bookId;
    } catch (err) {
      console.error('Error adding book:', err);
      setError(MESSAGES.BOOK_ADD_ERROR);
      setStatus(STATUS.ERROR);
      throw err;
    }
  }, [loadBooks]);

  /**
   * Delete a book
   * @param {number} bookId - Book ID
   */
  const removeBook = useCallback(async (bookId) => {
    try {
      setStatus(STATUS.LOADING);
      setError(null);
      await deleteBook(bookId);
      await loadBooks(); // Reload books after deleting
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(MESSAGES.BOOK_DELETE_ERROR);
      setStatus(STATUS.ERROR);
      throw err;
    }
  }, [loadBooks]);

  /**
   * Update book reading progress
   * @param {number} bookId - Book ID
   * @param {number} currentPage - Current page number
   */
  const updateProgress = useCallback(async (bookId, currentPage) => {
    try {
      await updateBookProgress(bookId, currentPage);
      // Update local state without full reload
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book.id === bookId
            ? { ...book, currentPage, lastRead: new Date().toISOString() }
            : book
        )
      );
    } catch (err) {
      console.error('Error updating progress:', err);
      setError(MESSAGES.BOOK_UPDATED_ERROR);
      throw err;
    }
  }, []);

  /**
   * Get a single book by ID
   * @param {number} bookId - Book ID
   * @returns {Promise<object>} Book object
   */
  const getBook = useCallback(async (bookId) => {
    try {
      return await getBookById(bookId);
    } catch (err) {
      console.error('Error getting book:', err);
      throw err;
    }
  }, []);

  /**
   * Filter books by category
   * @param {string} categoryId - Category ID ('all' for all books)
   * @returns {array} Filtered books
   */
  const filterByCategory = useCallback((categoryId) => {
    if (categoryId === 'all') return books;
    return books.filter(book => book.category === categoryId);
  }, [books]);

  /**
   * Search books by query
   * @param {string} query - Search query
   * @returns {array} Filtered books
   */
  const searchBooks = useCallback((query) => {
    if (!query || !query.trim()) return books;
    const lowerQuery = query.toLowerCase();
    return books.filter(book =>
      book.name.toLowerCase().includes(lowerQuery)
    );
  }, [books]);

  /**
   * Get recent books (sorted by added date)
   * @param {number} limit - Number of books to return
   * @returns {array} Recent books
   */
  const getRecentBooks = useCallback((limit = 5) => {
    return [...books]
      .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
      .slice(0, limit);
  }, [books]);

  /**
   * Get books count by category
   * @returns {object} Category counts
   */
  const getCategoryCounts = useCallback(() => {
    const counts = {};
    books.forEach(book => {
      counts[book.category] = (counts[book.category] || 0) + 1;
    });
    return counts;
  }, [books]);

  /**
   * Get total size of all books
   * @returns {number} Total size in bytes
   */
  const getTotalSize = useCallback(() => {
    return books.reduce((sum, book) => sum + (book.size || 0), 0);
  }, [books]);

  // Auto-load books on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      loadBooks();
    }
  }, [autoLoad, loadBooks]);

  return {
    books,
    loading,
    status,
    error,
    loadBooks,
    addBook,
    removeBook,
    updateProgress,
    getBook,
    filterByCategory,
    searchBooks,
    getRecentBooks,
    getCategoryCounts,
    getTotalSize,
  };
};

export default useBooks;
