import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  onAuthStateChange,
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
 * Manages authentication state globally via Supabase.
 * Uses onAuthStateChange as the single source of truth to avoid
 * duplicate getCurrentUser() calls and login loops.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on setup (synchronously after subscribe),
    // then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED for subsequent events.
    // We use it as the single init mechanism — no separate initAuth() call.
    const unsubscribe = onAuthStateChange(async (event, session) => {
      console.log('[AUTH]', event, session?.user?.email || 'no user');
      if (event === 'INITIAL_SESSION') {
        // First load — read from local session (no network call)
        if (session?.user) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
        setLoading(false);
        initializedRef.current = true;
        return;
      }

      // Ignore SIGNED_IN that fires right after INITIAL_SESSION for existing sessions
      if (event === 'SIGNED_IN' && !initializedRef.current) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    const loggedInUser = await loginService(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return user !== null;
  };

  /**
   * Check if current user is admin
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  /**
   * Update user in state after profile edit
   */
  const updateUser = async (updatedUser) => {
    if (updatedUser?.id) {
      setUser(updatedUser);
    } else {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
  };

  const value = {
    user,
    loading,
    login,
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
