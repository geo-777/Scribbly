import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
  const [authError, setAuthError] = useState(null);

  /**
   * Verify token validity and automatically log the user in via /auth/me
   */
  const checkAuth = useCallback(async () => {
    try {
      setStatus('loading');
      setAuthError(null);
      const userData = await api.auth.me();
      if (userData && (userData.id || userData.username)) {
        setUser(userData);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (err) {
      // If /me fails (e.g. 401 Unauthorized), we attempt a single refresh
      if (err instanceof ApiError && err.status === 401) {
        try {
          await api.auth.refresh();
          const freshUser = await api.auth.me();
          setUser(freshUser);
          setStatus('authenticated');
          return;
        } catch {
          // Refresh also failed or rate limited -> reset state to unauthenticated
        }
      }
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  // Run automatic login check on application mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login handler
   */
  const login = async ({ email, password }) => {
    setAuthError(null);
    try {
      await api.auth.login({ email, password });
      // Fetch user profile immediately after setting auth cookies
      const userData = await api.auth.me();
      setUser(userData);
      setStatus('authenticated');
      return userData;
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Register handler
   */
  const register = async ({ username, email, password }) => {
    setAuthError(null);
    try {
      await api.auth.register({ username, email, password });
      // Log in automatically after registration
      await api.auth.login({ email, password });
      const userData = await api.auth.me();
      setUser(userData);
      setStatus('authenticated');
      return userData;
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setAuthError(msg);
      throw err;
    }
  };

  /**
   * Logout handler
   */
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API failed, continuing with client logout', err);
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      setAuthError(null);
    }
  };

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    authError,
    setAuthError,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
