import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('teamsync_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('teamsync_token'));
  const [loading, setLoading] = useState(true);

  // Verify token and fetch fresh user profile on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('teamsync_token');
      if (storedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          localStorage.setItem('teamsync_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    localStorage.setItem('teamsync_token', data.token);
    const userPayload = {
      _id: data._id,
      name: data.name,
      email: data.email,
    };
    localStorage.setItem('teamsync_user', JSON.stringify(userPayload));
    setToken(data.token);
    setUser(userPayload);
    return data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const data = await authAPI.register({ name, email, password, confirmPassword });
    localStorage.setItem('teamsync_token', data.token);
    const userPayload = {
      _id: data._id,
      name: data.name,
      email: data.email,
    };
    localStorage.setItem('teamsync_user', JSON.stringify(userPayload));
    setToken(data.token);
    setUser(userPayload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('teamsync_token');
    localStorage.removeItem('teamsync_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
