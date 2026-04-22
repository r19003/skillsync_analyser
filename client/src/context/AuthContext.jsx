import { createContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, register as registerApi, getProfile } from '../api/authApi';

// ── Context creation ────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

const TOKEN_KEY = 'skillsync_token';
const USER_KEY  = 'skillsync_user';

/**
 * AuthProvider
 * Wraps the entire app. Provides: user, token, login(), register(), logout(), loading
 *
 * On mount: restores session from localStorage, validates token via /api/auth/profile
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true); // true while restoring session

  // ── Restore session on app load ──────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) { setLoading(false); return; }

      try {
        const { data } = await getProfile();
        setUser(data.user);
        setToken(savedToken);
      } catch {
        // Token expired or invalid — clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Persist token helper ─────────────────────────────────────────────────
  const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const { data } = await loginApi(credentials);
    saveSession(data.token, data.user);
    return data;
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const { data } = await registerApi(userData);
    saveSession(data.token, data.user);
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, loading, login, register, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
