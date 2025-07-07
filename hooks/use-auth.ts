'use client';

import { useState, useEffect } from 'react';

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
    const initAuth = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          setUser(JSON.parse(userData));
        }
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
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('visaProgress');
    localStorage.removeItem('chatHistory');
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