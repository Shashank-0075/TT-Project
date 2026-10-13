import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('campusfix_token');
    const savedUser = localStorage.getItem('campusfix_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token in background
        authApi.getProfile()
          .then((profile) => {
            setUser(profile);
            localStorage.setItem('campusfix_user', JSON.stringify(profile));
          })
          .catch(() => {
            // If failed (e.g., token expired or server reset), clear session
            logout();
          })
          .finally(() => setLoading(false));
        return;
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('campusfix_token', data.token);
    localStorage.setItem('campusfix_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    return data;
  };

  const logout = () => {
    authApi.logout();
    localStorage.removeItem('campusfix_token');
    localStorage.removeItem('campusfix_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedProfile) => {
    setUser(updatedProfile);
    localStorage.setItem('campusfix_user', JSON.stringify(updatedProfile));
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
