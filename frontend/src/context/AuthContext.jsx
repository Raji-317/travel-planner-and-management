import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(apiClient.getUser());
  const [token, setToken] = useState(apiClient.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = apiClient.getToken();
      if (savedToken) {
        try {
          const profile = await apiClient.get('/auth/me');
          if (profile && profile.user) {
            setUser(profile.user);
            apiClient.setUser(profile.user);
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      apiClient.setToken(res.token);
      apiClient.setUser(res.user);
      return res.user;
    }
    throw new Error('Invalid login response');
  };

  const registerTourist = async (email, password, fullName, phone) => {
    const res = await apiClient.post('/auth/register', {
      role: 'TOURIST',
      email,
      password,
      fullName,
      phone,
    });
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      apiClient.setToken(res.token);
      apiClient.setUser(res.user);
      return res.user;
    }
  };

  const registerOperator = async (formData) => {
    const res = await apiClient.post('/auth/register', {
      role: 'OPERATOR',
      ...formData,
    });
    if (res && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      apiClient.setToken(res.token);
      apiClient.setUser(res.user);
      return res;
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    apiClient.setUser(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isTourist: user?.role === 'TOURIST',
        isOperator: user?.role === 'OPERATOR',
        isAdmin: user?.role === 'ADMIN',
        login,
        registerTourist,
        registerOperator,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

