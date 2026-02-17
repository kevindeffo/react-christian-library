import { useState, useEffect, useMemo } from 'react';
import { getAllCategories } from '../services/categoryService';

/**
 * Custom hook to manage categories
 * Provides categories data and utility functions from Supabase
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        setCategories(data);
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
   */
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'other') || null;
  };

  /**
   * Get category name by ID
   */
  const getCategoryName = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : 'Autre';
  };

  /**
   * Get category color by ID
   */
  const getCategoryColor = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.color : '#64748b';
  };

  /**
   * Get category icon by ID
   */
  const getCategoryIcon = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category ? category.icon : '📑';
  };

  /**
   * Get categories as options for select/dropdown
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
