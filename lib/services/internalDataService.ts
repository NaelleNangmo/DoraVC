import { apiClient } from '@/lib/api';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface Place {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'tourist_site' | 'housing' | 'residence';
  location: string;
  countryCode: string;
  description?: string;
  price?: number;
  rating?: number;
  images?: string[];
  amenities?: string[];
  contact?: string;
  available?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  countryCode: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'freelance';
  description?: string;
  requirements?: string[];
  posted?: string;
  url?: string;
}

interface University {
  id: string;
  name: string;
  location: string;
  countryCode: string;
  ranking?: number;
  field?: string;
  level?: 'bachelor' | 'master' | 'phd';
  tuition?: string;
  admissionDeadline?: string;
  requirements?: string[];
  scholarships?: string[];
  website?: string;
}

interface Hotel extends Place {
  type: 'hotel';
  starRating?: number;
  checkIn?: string;
  checkOut?: string;
}

interface TouristSite extends Place {
  type: 'tourist_site';
  category?: string;
  entryFee?: number;
  openingHours?: string;
}

interface Residence extends Place {
  type: 'residence';
  rooms?: number;
  size?: string;
  leaseTerms?: string;
}

interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string;
  description?: string;
  photographer?: string;
  countryCode?: string;
}

interface IntegrationProgress {
  userId: number;
  countryCode?: string;
  completedTasks: string[];
  currentLocation?: string;
  essentialServices: {
    banking: boolean;
    healthcare: boolean;
    housing: boolean;
    transport: boolean;
    documentation: boolean;
  };
  socialIntegration: {
    languageCourse: boolean;
    communityGroups: boolean;
    localEvents: boolean;
    networking: boolean;
  };
}

interface IntegrationRecommendation {
  id: string;
  userId: number;
  type: 'tip' | 'resource' | 'event';
  title: string;
  description: string;
  countryCode: string;
  status: 'tourist' | 'worker' | 'student' | 'resident';
  date?: string;
  url?: string;
}

class InternalDataService {
  async searchPlaces(params: { location?: string; countryCode?: string; type?: 'hotel' | 'restaurant' | 'tourist_site' | 'housing' | 'residence'; page?: number; limit?: number }): Promise<PaginatedResponse<Place>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.countryCode) query.append('countryCode', params.countryCode);
      if (params.type) query.append('type', params.type);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const endpoint = `/places?${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Place>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des lieux');
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
      throw error;
    }
  }

  async searchHotels(params: { location?: string; countryCode?: string; starRating?: number; page?: number; limit?: number }): Promise<PaginatedResponse<Hotel>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.countryCode) query.append('countryCode', params.countryCode);
      if (params.starRating) query.append('starRating', params.starRating.toString());
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const endpoint = `/hotels?${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Hotel>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des hôtels');
    } catch (error) {
      console.error('Erreur lors de la recherche d\'hôtels:', error);
      throw error;
    }
  }

  async searchTouristSites(params: { location?: string; countryCode?: string; category?: string; page?: number; limit?: number }): Promise<PaginatedResponse<TouristSite>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.countryCode) query.append('countryCode', params.countryCode);
      if (params.category) query.append('category', params.category);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const endpoint = `/tourist-sites?${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<TouristSite>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des sites touristiques');
    } catch (error) {
      console.error('Erreur lors de la recherche de sites touristiques:', error);
      throw error;
    }
  }

  async searchResidences(params: { location?: string; countryCode?: string; rooms?: number; page?: number; limit?: number }): Promise<PaginatedResponse<Residence>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.countryCode) query.append('countryCode', params.countryCode);
      if (params.rooms) query.append('rooms', params.rooms.toString());
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const endpoint = `/residences?${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Residence>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des résidences');
    } catch (error) {
      console.error('Erreur lors de la recherche de résidences:', error);
      throw error;
    }
  }

  async searchJobs(params: { location?: string; countryCode?: string; skills?: string[]; jobType?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Job>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.countryCode) query.append('countryCode', params.countryCode);
      if (params.skills) query.append('skills', params.skills.join(','));
      if (params.jobType) query.append('jobType', params.jobType);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const endpoint = `/jobs?${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Job>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des emplois');
    } catch (error) {
      console.error('Erreur lors de la recherche d\'emplois:', error);
      throw error;
    }
  }

  async searchUniversities(params: { countryCode?: string; field?: string; level?: string; page?: number; limit?: number }): Promise<PaginatedResponse<University>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (params.countryCode) query.append('countryCode', params.countryCode);
      if (params.field) query.append('field', params.field);
      if (params.level) query.append('level', params.level);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const endpoint = `/universities?${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<University>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des universités');
    } catch (error) {
      console.error('Erreur lors de la recherche d\'universités:', error);
      throw error;
    }
  }

  async getGalleryImages(params: { countryCode?: string; query?: string; page?: number; limit?: number }): Promise<PaginatedResponse<GalleryImage>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (params.countryCode) query.append('countryCode', params.countryCode);
      if (params.query) query.append('query', params.query);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      const endpoint = `/gallery?${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<GalleryImage>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des images de la galerie');
    } catch (error) {
      console.error('Erreur lors de la récupération des images:', error);
      throw error;
    }
  }

  async getIntegrationProgress(userId: number, page?: number, limit?: number): Promise<PaginatedResponse<IntegrationProgress>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (page) query.append('page', page.toString());
      if (limit) query.append('limit', limit.toString());
      const endpoint = `/integration/progress?userId=${userId}&${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<IntegrationProgress>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des progrès d\'intégration');
    } catch (error) {
      console.error('Erreur lors de la récupération des progrès d\'intégration:', error);
      throw error;
    }
  }

  async updateIntegrationProgress(userId: number, updates: Partial<IntegrationProgress>): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.patch(`/integration/progress?userId=${userId}`, updates);
      if (!response.success) {
        throw new Error('Échec de la mise à jour des progrès d\'intégration');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des progrès d\'intégration:', error);
      throw error;
    }
  }

  async getIntegrationRecommendations(userId: number, countryCode: string, status: 'tourist' | 'worker' | 'student' | 'resident', page?: number, limit?: number): Promise<PaginatedResponse<IntegrationRecommendation>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const query = new URLSearchParams();
      if (page) query.append('page', page.toString());
      if (limit) query.append('limit', limit.toString());
      const endpoint = `/integration/recommendations?userId=${userId}&countryCode=${countryCode}&status=${status}&${query.toString()}`;
      const response = await apiClient.get<PaginatedResponse<IntegrationRecommendation>>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des recommandations d\'intégration');
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations d\'intégration:', error);
      throw error;
    }
  }
}

export const internalDataService = new InternalDataService();