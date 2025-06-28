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
  // Check users
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Check admins
  const admin = admins.find(a => a.email === email && a.password === password);
  if (admin) {
    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword as User;
  }

  return null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('currentUser');
  localStorage.removeItem('visaProgress');
  localStorage.removeItem('chatHistory');
};