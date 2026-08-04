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
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Checking authentication status...');
        const response = await api.get('/api/current-user');
        console.log('📧 AuthProvider: Auth response:', response.data);

        if (response.data.success && response.data.user) {
          console.log('✅ AuthProvider: User is authenticated:', response.data.user.username);
          setUser(response.data.user);
        } else {
          console.log('❌ AuthProvider: No authenticated user found');
          setUser(null);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.log('❌ AuthProvider: User not authenticated (401)');
          setUser(null);
        } else if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
          console.error('🌐 AuthProvider: Backend connection error:', err.message);
          setError('Backend server is not running. Please start the server.');
        } else {
          console.error('❌ AuthProvider: Auth check error:', err);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
        console.log('✅ AuthProvider: isLoading set to false');
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 AuthProvider: Login attempt for:', username);

      const response = await api.post('/login', { username, password });
      console.log('📧 AuthProvider: Login response:', response.data);

      if (response.data.success && response.data.user) {
        console.log('✅ AuthProvider: Login successful for:', response.data.user.username);
        setUser(response.data.user);
        // Return the full response so the Login component can check verification status
        return response.data;
      } else {
        console.log('❌ AuthProvider: Login failed - no user data');
        throw new Error('Login failed: No user data returned');
      }
    } catch (err: any) {
      console.error('❌ AuthProvider: Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.get('/logout');
      setUser(null);
      localStorage.removeItem('user');
      sessionStorage.clear();
      console.log('✅ AuthProvider: Logout successful');
    } catch (err) {
      console.error('❌ AuthProvider: Logout error:', err);
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