import { apiClient } from '@/lib/api';

export interface Notification {
  id: string;
  userId: number;
  type: 'visa_update' | 'community' | 'integration' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

class NotificationService {
  async getNotifications(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Notification>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.get<PaginatedResponse<Notification>>(`/notifications?userId=${userId}&page=${page}&limit=${limit}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des notifications');
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  async addNotification(userId: number, notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>): Promise<string> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.post<{ id: string }>(`/notifications?userId=${userId}`, notification);
      if (response.success && response.data) {
        return response.data.id;
      }
      throw new Error('Échec de l\'ajout de la notification');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la notification:', error);
      throw error;
    }
  }

  async markAsRead(userId: number, notificationId: string): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.patch(`/notifications/${notificationId}?userId=${userId}`, { read: true });
      if (!response.success) {
        throw new Error('Échec du marquage comme lu');
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  }

  async deleteNotification(userId: number, notificationId: string): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.delete(`/notifications/${notificationId}?userId=${userId}`);
      if (!response.success) {
        throw new Error('Échec de la suppression de la notification');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();