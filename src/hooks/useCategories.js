import { useState, useEffect, useMemo } from 'react';
import categoriesData from '../config/categories.json';

/**
 * Custom hook to manage categories
 * Provides categories data and utility functions
 * In the future, this will fetch from API instead of JSON
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call with setTimeout
    // Later this will be replaced with actual API call
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {object|null} Category object or null
   */
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'other') || null;
  };

  /**
   * Get category name by ID
   * @param {string} categoryId - Category ID
   * @returns {string} Category name
   */
  const getCategoryName = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : 'Autre';
  };

  /**
   * Get category color by ID
   * @param {string} categoryId - Category ID
   * @returns {string} Category color
   */
  const getCategoryColor = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.color : '#64748b';
  };

  /**
   * Get category icon by ID
   * @param {string} categoryId - Category ID
   * @returns {string} Category icon
   */
  const getCategoryIcon = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.icon : '📑';
  };

  /**
   * Get categories as options for select/dropdown
   * @returns {array} Array of {value, label} objects
   */
  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({
      value: cat.id,
      label: `${cat.icon} ${cat.name}`,
    }));
  }, [categories]);

  return {
    categories,
    loading,
    error,
    getCategoryById,
    getCategoryName,
    getCategoryColor,
    getCategoryIcon,
    categoryOptions,
  };
};

export default useCategories;
