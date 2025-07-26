import { apiClient } from '@/lib/api';

export interface CommunityPost {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  countryId?: number;
  countryName?: string;
  rating?: number;
  createdAt: string;
  approvedAt?: string;
  tags: string[];
  likes: number;
  dislikes: number;
  comments: number;
  views: number;
  userLiked?: boolean;
  userDisliked?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

class CommunityService {
  async getPosts(status?: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<CommunityPost>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const endpoint = status 
        ? `/community?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}` 
        : `/community?page=${page}&limit=${limit}`;
      const response = await apiClient.get<PaginatedResponse<CommunityPost>>(endpoint);
      if (response.success && response.data) {
        return {
          data: response.data.data.map(this.transformPost),
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
        };
      }
      throw new Error('Réponse backend invalide');
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      throw error;
    }
  }

  async getPost(id: number): Promise<CommunityPost> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.get<CommunityPost>(`/community/${id}`);
      if (response.success && response.data) {
        return this.transformPost(response.data);
      }
      throw new Error('Post non trouvé');
    } catch (error) {
      console.error('Erreur lors de la récupération du post:', error);
      throw error;
    }
  }

  async createPost(postData: Partial<CommunityPost>): Promise<CommunityPost> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.post<CommunityPost>('/community', {
        user_id: postData.userId,
        title: postData.title,
        content: postData.content,
        image: postData.image,
        country_id: postData.countryId,
        rating: postData.rating,
        tags: postData.tags,
      });
      if (response.success && response.data) {
        return this.transformPost(response.data);
      }
      throw new Error('Échec de la création du post');
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
      throw error;
    }
  }

  async updatePostStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<CommunityPost> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.patch<CommunityPost>(`/community/${id}/status`, { status });
      if (response.success && response.data) {
        return this.transformPost(response.data);
      }
      throw new Error('Échec de la mise à jour du statut');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  async updateLikes(id: number, likes: number, dislikes: number): Promise<CommunityPost> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.patch<CommunityPost>(`/community/${id}/likes`, { likes, dislikes });
      if (response.success && response.data) {
        return this.transformPost(response.data);
      }
      throw new Error('Échec de la mise à jour des likes');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des likes:', error);
      throw error;
    }
  }

  async deletePost(id: number): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.delete(`/community/${id}`);
      if (!response.success) {
        throw new Error('Échec de la suppression du post');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du post:', error);
      throw error;
    }
  }

  private transformPost(post: any): CommunityPost {
    return {
      id: post.id,
      userId: post.user_id || post.userId || 0,
      userName: post.user_name || post.userName || 'Utilisateur',
      userAvatar: post.user_avatar || post.userAvatar || '',
      title: post.title || '',
      content: post.content || '',
      image: post.image,
      status: post.status || 'pending',
      countryId: post.country_id || post.countryId,
      countryName: post.country_name || post.countryName,
      rating: post.rating || 0,
      createdAt: post.created_at || post.createdAt || new Date().toISOString(),
      approvedAt: post.approved_at || post.approvedAt,
      tags: Array.isArray(post.tags) ? post.tags : (post.tags ? JSON.parse(post.tags) : []),
      likes: post.likes || 0,
      dislikes: post.dislikes || 0,
      comments: post.comments || 0,
      views: post.views || 0,
      userLiked: post.userLiked || false,
      userDisliked: post.userDisliked || false,
    };
  }
}

export const communityService = new CommunityService();