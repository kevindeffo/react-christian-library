/**
 * Reading Progress Service
 * Manages user reading progress per book
 * TODO: Replace with API calls when backend is ready
 */

import readingProgressData from '../config/readingProgress.json';

const PROGRESS_STORAGE_KEY = 'reading_progress';

/**
 * Initialize reading progress in localStorage from JSON
 */
const initializeProgress = () => {
  const existingProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!existingProgress) {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(readingProgressData));
  }
};

/**
 * Get all reading progress
 * @returns {Array} Reading progress array
 */
const getAllProgress = () => {
  initializeProgress();
  const progress = localStorage.getItem(PROGRESS_STORAGE_KEY);
  return progress ? JSON.parse(progress) : [];
};

/**
 * Save all reading progress
 * @param {Array} progressArray - Progress array
 */
const saveAllProgress = (progressArray) => {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressArray));
};

/**
 * Get reading progress for a specific user and book
 * @param {number} userId - User ID
 * @param {number} bookId - Book ID
 * @returns {object|null} Reading progress or null
 */
export const getReadingProgress = (userId, bookId) => {
  const allProgress = getAllProgress();
  return allProgress.find(p => p.userId === userId && p.bookId === bookId) || null;
};

/**
 * Save or update reading progress
 * @param {number} userId - User ID
 * @param {number} bookId - Book ID
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total pages (optional)
 * @returns {object} Updated progress
 */
export const saveReadingProgress = async (userId, bookId, currentPage, totalPages = null) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const allProgress = getAllProgress();
  const existingIndex = allProgress.findIndex(
    p => p.userId === userId && p.bookId === bookId
  );

  const progress = {
    userId,
    bookId,
    currentPage,
    totalPages: totalPages || (existingIndex !== -1 ? allProgress[existingIndex].totalPages : null),
    lastReadAt: new Date().toISOString(),
    progress: totalPages ? Math.round((currentPage / totalPages) * 100) : 0
  };

  if (existingIndex !== -1) {
    // Update existing progress
    allProgress[existingIndex] = progress;
  } else {
    // Create new progress entry
    allProgress.push(progress);
  }

  saveAllProgress(allProgress);
  return progress;
};

/**
 * Get all reading progress for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of reading progress
 */
export const getUserReadingProgress = (userId) => {
  const allProgress = getAllProgress();
  return allProgress.filter(p => p.userId === userId);
};

/**
 * Get recently read books for a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of books to return
 * @returns {Array} Array of reading progress sorted by last read
 */
export const getRecentlyReadBooks = (userId, limit = 5) => {
  const userProgress = getUserReadingProgress(userId);
  return userProgress
    .sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt))
    .slice(0, limit);
};

/**
 * Delete reading progress
 * @param {number} userId - User ID
 * @param {number} bookId - Book ID
 */
export const deleteReadingProgress = (userId, bookId) => {
  const allProgress = getAllProgress();
  const filtered = allProgress.filter(
    p => !(p.userId === userId && p.bookId === bookId)
  );
  saveAllProgress(filtered);
};

/**
 * Get reading statistics for a user
 * @param {number} userId - User ID
 * @returns {object} Reading statistics
 */
export const getReadingStats = (userId) => {
  const userProgress = getUserReadingProgress(userId);

  const totalBooks = userProgress.length;
  const completedBooks = userProgress.filter(p => p.progress === 100).length;
  const inProgressBooks = userProgress.filter(p => p.progress > 0 && p.progress < 100).length;
  const averageProgress = totalBooks > 0
    ? Math.round(userProgress.reduce((sum, p) => sum + p.progress, 0) / totalBooks)
    : 0;

  return {
    totalBooks,
    completedBooks,
    inProgressBooks,
    averageProgress,
    lastRead: userProgress.length > 0
      ? userProgress.sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt))[0].lastReadAt
      : null
  };
};

export default {
  getReadingProgress,
  saveReadingProgress,
  getUserReadingProgress,
  getRecentlyReadBooks,
  deleteReadingProgress,
  getReadingStats,
};
