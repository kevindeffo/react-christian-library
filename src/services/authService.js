/**
 * Authentication Service
 * Manages user authentication with JSON storage
 * TODO: Replace with API calls when backend is ready
 */

import usersData from '../config/users.json';
import { STORAGE_KEYS } from '../utils/constants';

const USERS_STORAGE_KEY = 'app_users';
const SESSION_KEY = STORAGE_KEYS.USER_SESSION || 'user_session';

/**
 * Initialize users in localStorage from JSON
 * In production, this will be handled by backend
 */
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersData));
  }
};

/**
 * Get all users from storage
 * @returns {Array} List of users
 */
const getUsers = () => {
  initializeUsers();
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
};

/**
 * Save users to storage
 * @param {Array} users - Users array
 */
const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object without password
 */
export const login = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Don't store password in session
  const { password: _, ...userWithoutPassword } = user;

  // Store session
  const session = {
    user: userWithoutPassword,
    token: btoa(`${user.email}:${Date.now()}`), // Simple token for demo
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return userWithoutPassword;
};

/**
 * Register new user
 * @param {object} userData - User data
 * @returns {Promise<object>} Created user without password
 */
export const register = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const users = getUsers();

  // Check if email already exists
  if (users.find(u => u.email === userData.email)) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Create new user
  const newUser = {
    id: Math.max(...users.map(u => u.id), 0) + 1,
    email: userData.email,
    password: userData.password,
    name: userData.name,
    role: 'user', // Default role
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Auto-login after registration
  const { password: _, ...userWithoutPassword } = newUser;

  const session = {
    user: userWithoutPassword,
    token: btoa(`${newUser.email}:${Date.now()}`),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return userWithoutPassword;
};

/**
 * Logout current user
 */
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Get current user session
 * @returns {object|null} Current session or null
 */
export const getCurrentSession = () => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;

  try {
    const parsedSession = JSON.parse(session);

    // Check if session is expired
    if (parsedSession.expiresAt < Date.now()) {
      logout();
      return null;
    }

    return parsedSession;
  } catch (error) {
    console.error('Error parsing session:', error);
    logout();
    return null;
  }
};

/**
 * Get current user
 * @returns {object|null} Current user or null
 */
export const getCurrentUser = () => {
  const session = getCurrentSession();
  return session ? session.user : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return getCurrentSession() !== null;
};

/**
 * Check if current user is admin
 * @returns {boolean} True if admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

/**
 * Update user profile
 * @param {object} updates - Profile updates
 * @returns {Promise<object>} Updated user
 */
export const updateProfile = async (updates) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const session = getCurrentSession();
  if (!session) {
    throw new Error('Non authentifié');
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === session.user.id);

  if (userIndex === -1) {
    throw new Error('Utilisateur non trouvé');
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    id: users[userIndex].id, // Don't allow ID change
    role: users[userIndex].role, // Don't allow role change
  };

  saveUsers(users);

  // Update session
  const { password: _, ...userWithoutPassword } = users[userIndex];
  session.user = userWithoutPassword;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return userWithoutPassword;
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const changePassword = async (currentPassword, newPassword) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const session = getCurrentSession();
  if (!session) {
    throw new Error('Non authentifié');
  }

  const users = getUsers();
  const user = users.find(u => u.id === session.user.id);

  if (!user || user.password !== currentPassword) {
    throw new Error('Mot de passe actuel incorrect');
  }

  // Update password
  user.password = newPassword;
  saveUsers(users);
};

export default {
  login,
  register,
  logout,
  getCurrentSession,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  updateProfile,
  changePassword,
};
