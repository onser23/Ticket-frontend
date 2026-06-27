import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_TOKEN_KEY, USER_DATA_KEY } from '../utils/constants';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN_KEY);
    const stored = localStorage.getItem(USER_DATA_KEY);
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(USER_DATA_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem(USER_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <UserAuthContext.Provider
      value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
};
