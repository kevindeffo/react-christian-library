/**
 * Reading Progress Service
 * Manages user reading progress with Supabase Database
 */

import { supabase } from '../lib/supabase';

/**
 * Map snake_case DB row to camelCase
 */
const mapProgress = (row) => ({
  id: row.id,
  userId: row.user_id,
  bookId: row.book_id,
  currentPage: row.current_page,
  totalPages: row.total_pages,
  progress: row.progress,
  lastReadAt: row.last_read_at,
});

/**
 * Get reading progress for a specific user and book
 * @param {string} userId - User UUID
 * @param {string} bookId - Book UUID
 * @returns {Promise<object|null>} Reading progress or null
 */
export const getReadingProgress = async (userId, bookId) => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching reading progress:', error);
    return null;
  }

  return mapProgress(data);
};

/**
 * Save or update reading progress
 * @param {string} userId - User UUID
 * @param {string} bookId - Book UUID
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total pages
 * @returns {Promise<object>} Updated progress
 */
export const saveReadingProgress = async (userId, bookId, currentPage, totalPages = null) => {
  const upsertData = {
    user_id: userId,
    book_id: bookId,
    current_page: currentPage,
    last_read_at: new Date().toISOString(),
  };

  if (totalPages !== null) {
    upsertData.total_pages = totalPages;
  }

  const { data, error } = await supabase
    .from('reading_progress')
    .upsert(upsertData, { onConflict: 'user_id,book_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving reading progress:', error);
    throw error;
  }

  return mapProgress(data);
};

/**
 * Get all reading progress for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of reading progress
 */
export const getUserReadingProgress = async (userId) => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reading progress:', error);
    return [];
  }

  return (data || []).map(mapProgress);
};

/**
 * Get recently read books for a user
 * @param {string} userId - User UUID
 * @param {number} limit - Number of books to return
 * @returns {Promise<Array>} Array of reading progress sorted by last read
 */
export const getRecentlyReadBooks = async (userId, limit = 5) => {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recently read books:', error);
    return [];
  }

  return (data || []).map(mapProgress);
};

/**
 * Delete reading progress
 * @param {string} userId - User UUID
 * @param {string} bookId - Book UUID
 */
export const deleteReadingProgress = async (userId, bookId) => {
  const { error } = await supabase
    .from('reading_progress')
    .delete()
    .eq('user_id', userId)
    .eq('book_id', bookId);

  if (error) {
    console.error('Error deleting reading progress:', error);
    throw error;
  }
};

/**
 * Get reading statistics for a user
 * @param {string} userId - User UUID
 * @returns {Promise<object>} Reading statistics
 */
export const getReadingStats = async (userId) => {
  const userProgress = await getUserReadingProgress(userId);

  const totalBooks = userProgress.length;
  const completedBooks = userProgress.filter(p => p.progress >= 100).length;
  const inProgressBooks = userProgress.filter(p => p.progress > 0 && p.progress < 100).length;
  const averageProgress = totalBooks > 0
    ? Math.round(userProgress.reduce((sum, p) => sum + p.progress, 0) / totalBooks)
    : 0;

  return {
    totalBooks,
    completedBooks,
    inProgressBooks,
    averageProgress,
    lastRead: userProgress.length > 0 ? userProgress[0].lastReadAt : null,
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
