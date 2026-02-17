/**
 * Category Service
 * Manages categories with Supabase Database
 */

import { supabase } from '../lib/supabase';

/**
 * Get all categories
 * @returns {Promise<Array>} List of categories
 */
export const getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erreur lors du chargement des catégories:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<object|null>} Category or null
 */
export const getCategoryById = async (categoryId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Erreur lors du chargement de la catégorie:', error);
    return null;
  }

  return data;
};

export default {
  getAllCategories,
  getCategoryById,
};
