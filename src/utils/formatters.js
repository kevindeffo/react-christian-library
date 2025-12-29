/**
 * Utility functions for formatting data
 * Centralized formatters to avoid code duplication
 */

/**
 * Format a date string to French locale format
 * @param {string} dateString - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Non spécifié';

  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};

/**
 * Format a date with time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatSize = (bytes, decimals = 2) => {
  if (bytes === 0 || bytes === null || bytes === undefined) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a number as currency (FCFA)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return 'Gratuit';

  const numAmount = parseFloat(amount);
  if (numAmount === 0) return 'Gratuit';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount).replace('XAF', 'FCFA');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} total - Total value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
};

/**
 * Remove file extension from filename
 * @param {string} filename - Filename with extension
 * @returns {string} Filename without extension
 */
export const removeFileExtension = (filename) => {
  if (!filename) return '';
  return filename.replace(/\.[^/.]+$/, '');
};

/**
 * Generate initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '?';

  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Pluralize a word based on count
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, defaults to singular + 's')
 * @returns {string} Pluralized word
 */
export const pluralize = (count, singular, plural = null) => {
  return count > 1 ? (plural || `${singular}s`) : singular;
};
