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

class CommunityService {
  async getPosts(status?: string): Promise<CommunityPost[]> {
    try {
      if (apiClient.isOnline()) {
        const endpoint = status ? `/community?status=${status}` : '/community';
        const response = await apiClient.get<CommunityPost[]>(endpoint);
        
        if (response.success && response.data) {
          return response.data.map(this.transformPost);
        }
      }
    } catch (error) {
      console.log('Récupération backend échouée, utilisation des données locales');
    }

    // Fallback sur les données locales
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      return status ? posts.filter((p: CommunityPost) => p.status === status) : posts;
    }

    return [];
  }

  async getPost(id: number): Promise<CommunityPost | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.get<CommunityPost>(`/community/${id}`);
        
        if (response.success && response.data) {
          return this.transformPost(response.data);
        }
      }
    } catch (error) {
      console.log('Récupération backend échouée, utilisation des données locales');
    }

    // Fallback sur les données locales
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      return posts.find((p: CommunityPost) => p.id === id) || null;
    }

    return null;
  }

  async createPost(postData: Partial<CommunityPost>): Promise<CommunityPost | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.post<CommunityPost>('/community', {
          country_id: postData.countryId,
          title: postData.title,
          content: postData.content,
          image: postData.image,
          rating: postData.rating,
          tags: postData.tags
        });
        
        if (response.success && response.data) {
          return this.transformPost(response.data);
        }
      }
    } catch (error) {
      console.log('Création backend échouée, sauvegarde locale');
    }

    // Fallback sur la sauvegarde locale
    const newPost: CommunityPost = {
      id: Date.now(),
      userId: postData.userId || 0,
      userName: postData.userName || 'Utilisateur',
      userAvatar: postData.userAvatar || '',
      title: postData.title || '',
      content: postData.content || '',
      image: postData.image,
      status: 'pending',
      countryId: postData.countryId,
      countryName: postData.countryName,
      rating: postData.rating,
      createdAt: new Date().toISOString(),
      tags: postData.tags || [],
      likes: 0,
      dislikes: 0,
      comments: 0,
      views: 0
    };

    // Sauvegarder localement
    const savedPosts = localStorage.getItem('communityPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    posts.push(newPost);
    localStorage.setItem('communityPosts', JSON.stringify(posts));

    return newPost;
  }

  async updatePostStatus(id: number, status: string): Promise<CommunityPost | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.patch<CommunityPost>(`/community/${id}/status`, { status });
        
        if (response.success && response.data) {
          return this.transformPost(response.data);
        }
      }
    } catch (error) {
      console.log('Mise à jour backend échouée, mise à jour locale');
    }

    // Fallback sur la mise à jour locale
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const postIndex = posts.findIndex((p: CommunityPost) => p.id === id);
      
      if (postIndex !== -1) {
        posts[postIndex].status = status;
        if (status === 'approved') {
          posts[postIndex].approvedAt = new Date().toISOString();
        }
        localStorage.setItem('communityPosts', JSON.stringify(posts));
        return posts[postIndex];
      }
    }

    return null;
  }

  async updateLikes(id: number, likes: number, dislikes: number): Promise<CommunityPost | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.patch<CommunityPost>(`/community/${id}/likes`, { likes, dislikes });
        
        if (response.success && response.data) {
          return this.transformPost(response.data);
        }
      }
    } catch (error) {
      console.log('Mise à jour backend échouée, mise à jour locale');
    }

    // Fallback sur la mise à jour locale
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const postIndex = posts.findIndex((p: CommunityPost) => p.id === id);
      
      if (postIndex !== -1) {
        posts[postIndex].likes = likes;
        posts[postIndex].dislikes = dislikes;
        localStorage.setItem('communityPosts', JSON.stringify(posts));
        return posts[postIndex];
      }
    }

    return null;
  }

  async deletePost(id: number): Promise<boolean> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.delete(`/community/${id}`);
        
        if (response.success) {
          return true;
        }
      }
    } catch (error) {
      console.log('Suppression backend échouée, suppression locale');
    }

    // Fallback sur la suppression locale
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const filteredPosts = posts.filter((p: CommunityPost) => p.id !== id);
      localStorage.setItem('communityPosts', JSON.stringify(filteredPosts));
      return true;
    }

    return false;
  }

  private transformPost(post: any): CommunityPost {
    return {
      id: post.id,
      userId: post.user_id || post.userId,
      userName: post.user_name || post.userName,
      userAvatar: post.user_avatar || post.userAvatar,
      title: post.title,
      content: post.content,
      image: post.image,
      status: post.status,
      countryId: post.country_id || post.countryId,
      countryName: post.country_name || post.countryName,
      rating: post.rating,
      createdAt: post.created_at || post.createdAt,
      approvedAt: post.approved_at || post.approvedAt,
      tags: Array.isArray(post.tags) ? post.tags : (post.tags ? JSON.parse(post.tags) : []),
      likes: post.likes || 0,
      dislikes: post.dislikes || 0,
      comments: post.comments || 0,
      views: post.views || 0,
      userLiked: post.userLiked,
      userDisliked: post.userDisliked
    };
  }
}

export const communityService = new CommunityService();