/**
 * Book Access Service
 * Manages user access to books (admin grants/revokes, user checks)
 */

import { supabase } from '../lib/supabase';

/**
 * Grant access to a book for a user
 * @param {string} userId
 * @param {string} bookId
 * @param {string|null} expiresAt - ISO date string or null for unlimited
 * @returns {Promise<object>}
 */
export const grantAccess = async (userId, bookId, expiresAt = null) => {
  const { data: { session } } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from('user_book_access')
    .upsert(
      {
        user_id: userId,
        book_id: bookId,
        expires_at: expiresAt,
        granted_by: session?.user?.id,
        granted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,book_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error granting access:', error);
    throw error;
  }

  return data;
};

/**
 * Revoke access to a book for a user
 * @param {string} userId
 * @param {string} bookId
 * @returns {Promise<void>}
 */
export const revokeAccess = async (userId, bookId) => {
  const { error } = await supabase
    .from('user_book_access')
    .delete()
    .eq('user_id', userId)
    .eq('book_id', bookId);

  if (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
};

/**
 * Get all access entries for a user (with book info)
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserAccess = async (userId) => {
  const { data, error } = await supabase
    .from('user_book_access')
    .select('*, books(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user access:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get all users with access to a specific book
 * @param {string} bookId
 * @returns {Promise<Array>}
 */
export const getBookAccessList = async (bookId) => {
  const { data, error } = await supabase
    .from('user_book_access')
    .select('*, user_profiles(*)')
    .eq('book_id', bookId);

  if (error) {
    console.error('Error fetching book access list:', error);
    throw error;
  }

  return data || [];
};

/**
 * Check if a user has active access to a book
 * @param {string} userId
 * @param {string} bookId
 * @returns {Promise<{hasAccess: boolean, expired: boolean}>}
 */
export const checkAccess = async (userId, bookId) => {
  const { data, error } = await supabase
    .from('user_book_access')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  if (error) {
    console.error('Error checking access:', error);
    return { hasAccess: false, expired: false };
  }

  if (!data) {
    return { hasAccess: false, expired: false };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { hasAccess: false, expired: true };
  }

  return { hasAccess: true, expired: false };
};

/**
 * Get all books a user has access to (with book details)
 * Filters out expired access.
 * @param {string} userId
 * @returns {Promise<Array>} Books with access info
 */
export const getUserAccessibleBooks = async (userId) => {
  const { data, error } = await supabase
    .from('user_book_access')
    .select('*, books(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching accessible books:', error);
    throw error;
  }

  const now = new Date();
  return (data || [])
    .filter(entry => !entry.expires_at || new Date(entry.expires_at) > now)
    .map(entry => ({
      ...entry.books,
      access: {
        grantedAt: entry.granted_at,
        expiresAt: entry.expires_at,
      },
    }));
};
