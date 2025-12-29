// Theme configuration for the application
// Centralized colors, spacing, and other design tokens

export const colors = {
  // Primary colors
  primary: '#8b5cf6',
  primaryLight: '#a78bfa',
  primaryDark: '#7c3aed',

  // Secondary colors
  secondary: '#3b82f6',
  secondaryLight: '#60a5fa',
  secondaryDark: '#2563eb',

  // Accent colors
  accent: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',

  // Neutral colors
  text: '#5f6368',
  textLight: '#9ca3af',
  textDark: '#1f2937',

  // Background colors
  background: '#f8f9fa',
  backgroundLight: '#ffffff',
  backgroundDark: '#f3f4f6',

  // Border colors
  border: '#e0e0e0',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '15px',
  xl: '20px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Helper function to get color with opacity
export const withOpacity = (color, opacity) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

export default {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  fontSize,
  fontWeight,
  withOpacity,
};
