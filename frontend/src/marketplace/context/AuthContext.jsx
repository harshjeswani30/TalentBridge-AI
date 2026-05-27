import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Theme ──────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mp_theme') || 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('mp_theme', next);
      return next;
    });
  }, []);

  // ── Auth ───────────────────────────────────────────────────
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('tb_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axiosInstance.get('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      localStorage.removeItem('tb_token');
      localStorage.removeItem('tb_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    localStorage.setItem('tb_token', data.token);
    localStorage.setItem('tb_user', JSON.stringify(data.user));
    setUser(data.user);
    const me = await axiosInstance.get('/auth/me');
    setProfile(me.data.profile);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await axiosInstance.post('/auth/register', payload);
    localStorage.setItem('tb_token', data.token);
    localStorage.setItem('tb_user', JSON.stringify(data.user));
    setUser(data.user);
    const me = await axiosInstance.get('/auth/me');
    setProfile(me.data.profile);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('tb_token');
    localStorage.removeItem('tb_user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const me = await axiosInstance.get('/auth/me');
    setProfile(me.data.profile);
    return me.data.profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading,
        login, register, logout, refreshProfile,
        theme, toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
