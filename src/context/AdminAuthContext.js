import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_TOKEN_KEY, ADMIN_DATA_KEY } from '../utils/constants';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const stored = localStorage.getItem(ADMIN_DATA_KEY);
    if (token && stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem(ADMIN_DATA_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, login, logout, loading, isAuthenticated: !!admin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
