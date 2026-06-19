import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  forgotPassword: (data: { email: string }) => Promise<void>;
  resetPassword: (data: { password: string }, token?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (data: any) => {
    const res = await authApi.login(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('token', res.token);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('token', res.token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore API error on logout, clear locally anyway
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const forgotPassword = async (data: { email: string }) => {
    await authApi.forgotPassword(data);
  };

  const resetPassword = async (data: { password: string }, token?: string) => {
    await authApi.resetPassword(data, token);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, forgotPassword, resetPassword }}>
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
