'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, logout as localLogout, type User } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const localUser = getCurrentUser();
        setUser(localUser);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setCurrentUser(userData);
  };

  const logout = () => {
    localLogout();
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};