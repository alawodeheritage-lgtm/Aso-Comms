// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api/axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'customer' | 'manager' | 'ceo';
  phoneNumber?: string;
  status: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/current-user');
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setUser(null);
        } else if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
          setError('Backend server is not running. Please start the server.');
          console.error('Backend connection error:', err.message);
        } else {
          console.error('Auth check error:', err);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/login', { username, password });
      if (response.data.user) {
        setUser(response.data.user);
      }
      return response.data;
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.get('/logout');
      setUser(null);
      // Clear any stored data
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API call fails, clear user state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};