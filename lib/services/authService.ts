import { apiClient } from '@/lib/api';
import { authenticateUser, setCurrentUser, logout as localLogout, type User } from '@/lib/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // Essayer d'abord avec le backend
      if (apiClient.isOnline()) {
        const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
        
        if (response.success && response.data) {
          // Sauvegarder le token
          localStorage.setItem('authToken', response.data.token);
          setCurrentUser(response.data.user);
          return response.data.user;
        }
      }
    } catch (error) {
      console.log('Connexion backend échouée, utilisation de l\'authentification locale');
    }

    // Fallback sur l'authentification locale
    const user = authenticateUser(credentials.email, credentials.password);
    if (user) {
      setCurrentUser(user);
      return user;
    }

    return null;
  }

  async register(userData: RegisterData): Promise<User | null> {
    try {
      // Essayer d'abord avec le backend
      if (apiClient.isOnline()) {
        const response = await apiClient.post<{ user: User; token: string }>('/auth/register', userData);
        
        if (response.success && response.data) {
          // Sauvegarder le token
          localStorage.setItem('authToken', response.data.token);
          setCurrentUser(response.data.user);
          return response.data.user;
        }
      }
    } catch (error) {
      console.log('Inscription backend échouée, création locale');
    }

    // Fallback sur la création locale
    const newUser: User = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      joinedDate: new Date().toISOString().split('T')[0],
      preferences: {
        language: 'fr',
        currency: 'EUR'
      }
    };

    setCurrentUser(newUser);
    return newUser;
  }

  async verify(): Promise<User | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.get<{ user: User }>('/auth/verify');
        
        if (response.success && response.data) {
          setCurrentUser(response.data.user);
          return response.data.user;
        }
      }
    } catch (error) {
      console.log('Vérification backend échouée, utilisation des données locales');
    }

    // Fallback sur les données locales
    return getCurrentUser();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localLogout();
  }
}

export const authService = new AuthService();