/**
 * User Service
 * Manages user creation and listing (admin only)
 */

import { supabase, getSupabaseAdmin } from '../lib/supabase';

/**
 * Create a new user (admin only)
 * Uses supabaseAdmin to avoid losing the admin's session.
 * @param {string} email
 * @param {string} name
 * @param {string} password
 * @returns {Promise<object>} Created user
 */
export const createUser = async (email, name, password) => {
  const { data, error } = await getSupabaseAdmin().auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Cet email est déjà utilisé');
    }
    throw new Error(error.message);
  }

  // Le trigger handle_new_user crée le profil automatiquement.
  // On met à jour le nom au cas où le trigger n'a pas encore fini.
  const userId = data.user.id;

  // Petit délai pour laisser le trigger s'exécuter
  await new Promise(resolve => setTimeout(resolve, 500));

  await supabase
    .from('user_profiles')
    .update({ name })
    .eq('id', userId);

  return {
    id: userId,
    email: data.user.email,
    name,
    role: 'user',
    createdAt: data.user.created_at,
  };
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} List of user profiles
 */
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get user by ID
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching user:', error);
    throw error;
  }

  return data;
};
