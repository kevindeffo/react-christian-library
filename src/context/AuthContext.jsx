import { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  isAuthenticated as checkAuth,
  isAdmin as checkAdmin,
} from '../services/authService';

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Manages authentication state globally
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} User object
   */
  const login = async (email, password) => {
    try {
      const user = await loginService(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register new user
   * @param {object} userData
   * @returns {Promise<object>} User object
   */
  const register = async (userData) => {
    try {
      const user = await registerService(userData);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout current user
   */
  const logout = () => {
    logoutService();
    setUser(null);
  };

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = () => {
    return checkAuth();
  };

  /**
   * Check if current user is admin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return checkAdmin();
  };

  /**
   * Update user profile
   * @param {object} updatedUser - Updated user data
   */
  const updateUser = (updatedUser) => {
    // Update in localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
