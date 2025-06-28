import users from '@/data/users.json';
import admins from '@/data/admins.json';

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

export const authenticateUser = (email: string, password: string): User | null => {
  try {
    if (!email || !password) {
      return null;
    }

    // Check users
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }

    // Check admins
    const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (admin) {
      const { password: _, ...adminWithoutPassword } = admin;
      return adminWithoutPassword as User;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

export const setCurrentUser = (user: User) => {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
  }
};

export const logout = () => {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('visaProgress');
    localStorage.removeItem('chatHistory');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  return password.length >= 6;
};