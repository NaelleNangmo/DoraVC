import { apiClient } from '@/lib/api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  nationality?: string;
  currentCountry?: string;
  status: 'tourist' | 'worker' | 'student' | 'resident';
  preferences: {
    language: string;
    currency: string;
    notifications: boolean;
  };
  profile: {
    skills?: string[];
    experience?: string;
    jobType?: 'full-time' | 'part-time' | 'freelance';
    field?: string;
    level?: 'bachelor' | 'master' | 'phd';
    budget?: number;
    familySize?: number;
    housingType?: 'apartment' | 'house' | 'studio';
    interests?: string[];
    travelHistory?: string[];
  };
  visaApplications: VisaApplication[];
  savedPlaces: SavedPlace[];
  integrationProgress: IntegrationProgress;
}

export interface VisaApplication {
  id: string;
  countryCode: string;
  countryName: string;
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected';
  currentStep: number;
  totalSteps: number;
  documents: Document[];
  submittedAt?: Date;
  expectedDecision?: Date;
  notes?: string;
}

export interface Document {
  name: string;
  uploaded: boolean;
  fileUrl?: string;
}

export interface SavedPlace {
  id: string;
  type: 'hotel' | 'restaurant' | 'tourist_site' | 'job' | 'university' | 'housing';
  name: string;
  location: string;
  countryCode: string;
  savedAt: Date;
  notes?: string;
}

export interface IntegrationProgress {
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

class UserProfileService {
  async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.get<UserProfile>(`/users/${userId}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Profil non trouvé');
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: number, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.put<UserProfile>(`/users/${userId}`, updates);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la mise à jour du profil');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  async addVisaApplication(userId: number, application: Omit<VisaApplication, 'id'>): Promise<string> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.post<{ id: string }>(`/users/${userId}/visa-applications`, application);
      if (response.success && response.data) {
        return response.data.id;
      }
      throw new Error('Échec de l\'ajout de la demande de visa');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la demande de visa:', error);
      throw error;
    }
  }

  async updateVisaApplication(userId: number, applicationId: string, updates: Partial<VisaApplication>): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.patch(`/users/${userId}/visa-applications/${applicationId}`, updates);
      if (!response.success) {
        throw new Error('Échec de la mise à jour de la demande de visa');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la demande de visa:', error);
      throw error;
    }
  }

  async savePlace(userId: number, place: Omit<SavedPlace, 'id' | 'savedAt'>): Promise<string> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.post<{ id: string }>(`/users/${userId}/saved-places`, place);
      if (response.success && response.data) {
        return response.data.id;
      }
      throw new Error('Échec de la sauvegarde du lieu');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du lieu:', error);
      throw error;
    }
  }

  async removeSavedPlace(userId: number, placeId: string): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.delete(`/users/${userId}/saved-places/${placeId}`);
      if (!response.success) {
        throw new Error('Échec de la suppression du lieu');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error);
      throw error;
    }
  }

  async updateIntegrationProgress(userId: number, updates: Partial<IntegrationProgress>): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.patch(`/users/${userId}/integration-progress`, updates);
      if (!response.success) {
        throw new Error('Échec de la mise à jour du progrès d\'intégration');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du progrès d\'intégration:', error);
      throw error;
    }
  }

  async getPersonalizedRecommendations(userId: number, countryCode: string): Promise<any> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.get(`/users/${userId}/recommendations?countryCode=${countryCode}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la récupération des recommandations');
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      throw error;
    }
  }

  async calculateCountryCompatibility(userId: number, countryCode: string): Promise<number> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.get<{ score: number }>(`/users/${userId}/compatibility?countryCode=${countryCode}`);
      if (response.success && response.data) {
        return response.data.score;
      }
      throw new Error('Échec du calcul de compatibilité');
    } catch (error) {
      console.error('Erreur lors du calcul de compatibilité:', error);
      throw error;
    }
  }
}

export const userProfileService = new UserProfileService();