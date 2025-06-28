'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';
import { getCurrentUser } from '@/lib/auth';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  joinedDate?: string;
  preferences?: {
    language: string;
    currency: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Essayer de vérifier avec le backend d'abord
        const verifiedUser = await authService.verify();
        setUser(verifiedUser);
      } catch (error) {
        // Fallback sur les données locales
        const localUser = getCurrentUser();
        setUser(localUser);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return null;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User | null> => {
    try {
      const userData = await authService.register({ name, email, password });
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return null;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};