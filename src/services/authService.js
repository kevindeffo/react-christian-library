/**
 * Authentication Service
 * Manages user authentication with Supabase Auth
 */

import { supabase } from '../lib/supabase';

/**
 * Get user profile from user_profiles table
 * @param {string} userId - User UUID
 * @returns {Promise<object|null>} Profile or null
 */
const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

/**
 * Build a user object from Supabase auth user + profile
 */
const buildUser = async (authUser) => {
  if (!authUser) return null;

  const profile = await getUserProfile(authUser.id);

  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || authUser.user_metadata?.name || 'Utilisateur',
    role: profile?.role || 'user',
    createdAt: authUser.created_at,
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object with profile
 */
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('Email ou mot de passe incorrect');
  }

  return buildUser(data.user);
};

/**
 * Register new user
 * @param {object} userData - User data
 * @returns {Promise<object>} Created user
 */
export const register = async (userData) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Cet email est déjà utilisé');
    }
    throw new Error(error.message);
  }

  // Le trigger handle_new_user cree le profil, mais il peut y avoir un delai.
  // On retourne les infos depuis la reponse auth directement.
  return {
    id: data.user.id,
    email: data.user.email,
    name: userData.name,
    role: 'user',
    createdAt: data.user.created_at,
  };
};

/**
 * Logout current user
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

/**
 * Get current user from session (no network call)
 * Uses getSession() which reads from local storage, then enriches with profile.
 * @returns {Promise<object|null>} Current user or null
 */
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return null;

  return buildUser(session.user);
};

/**
 * Update user profile
 * @param {object} updates - Profile updates (name, email)
 * @returns {Promise<object>} Updated user
 */
export const updateProfile = async (updates) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('Non authentifié');
  }

  // Update name in user_profiles
  if (updates.name) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ name: updates.name })
      .eq('id', session.user.id);

    if (error) throw new Error('Erreur lors de la mise à jour du profil');
  }

  // Update email via Supabase Auth if changed
  if (updates.email && updates.email !== session.user.email) {
    const { error } = await supabase.auth.updateUser({
      email: updates.email,
    });
    if (error) throw new Error('Erreur lors de la mise à jour de l\'email');
  }

  return getCurrentUser();
};

/**
 * Change password
 * @param {string} currentPassword - Current password (unused with Supabase, kept for API compat)
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const changePassword = async (currentPassword, newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error('Erreur lors du changement de mot de passe');
  }
};

/**
 * Listen for auth state changes
 * @param {Function} callback - Called with (event, session)
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  onAuthStateChange,
};
