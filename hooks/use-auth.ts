'use client';

import { useState, useEffect } from 'react';
import { User, getCurrentUser, setCurrentUser, logout as authLogout } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setCurrentUser(userData);
    setUser(userData);
  };

  const logout = () => {
    authLogout();
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