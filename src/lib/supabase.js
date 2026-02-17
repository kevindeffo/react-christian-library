import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin séparé : utilisé uniquement pour créer des utilisateurs
// depuis l'interface admin sans perdre la session admin courante.
// storageKey distinct pour éviter toute interférence avec le client principal.
let _supabaseAdmin = null;
export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: 'sb-admin-create-user',
        detectSessionInUrl: false,
      },
    });
  }
  return _supabaseAdmin;
};
