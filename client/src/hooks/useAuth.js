import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth hook — shortcut to consume AuthContext anywhere.
 * Usage:  const { user, login, logout, isAuthenticated } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};

export default useAuth;
