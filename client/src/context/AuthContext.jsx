import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campuscash_token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('campuscash_theme') || 'dark');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.body.className = `${theme}-theme`;
    localStorage.setItem('campuscash_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('campuscash_token', newToken);
    setToken(newToken);
    setUser(userData);
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('campuscash_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toggleTheme,
        toast,
        showToast,
        login,
        logout,
        refreshUser: fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
