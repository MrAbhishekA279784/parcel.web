import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../../types';
import { apiFetch } from '../lib/api';

interface AuthContextType {
  user: User | null;
  activeRole: Role | null;
  login: (email: string, password?: string) => Promise<User>;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('parcelflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Active role is strictly derived from the authenticated user's account
  const activeRole: Role | null = user?.role || null;

  const login = async (email: string, password = 'demo123'): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });
      setUser(res.user);
      localStorage.setItem('parcelflow_user', JSON.stringify(res.user));
      localStorage.setItem('parcelflow_token', res.token);

      // Land directly in the portal matching the user account's role
      const targetPath = res.user.role === 'customer' 
        ? '/customer' 
        : res.user.role === 'operator' 
          ? '/operator' 
          : '/admin';
      window.history.replaceState(null, '', targetPath);

      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password = 'demo123', phone = ''): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, phone: phone.trim() })
      });
      setUser(res.user);
      localStorage.setItem('parcelflow_user', JSON.stringify(res.user));
      localStorage.setItem('parcelflow_token', res.token);

      window.history.replaceState(null, '', '/customer');
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parcelflow_user');
    localStorage.removeItem('parcelflow_token');
    localStorage.removeItem('parcelflow_active_role');
    window.history.replaceState(null, '', '/login');
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

