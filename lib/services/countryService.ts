import { apiClient } from '@/lib/api';

export interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  continent: string;
  capital: string;
  currency: string;
  language: string;
  image: string;
  description: string;
  visaRequired: boolean;
  processingTime: string;
  averageCost: number;
  popularSeason: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

class CountryService {
  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Country>> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.get<PaginatedResponse<Country>>(`/countries?page=${page}&limit=${limit}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Réponse backend invalide');
    } catch (error) {
      console.error('Erreur lors de la récupération des pays:', error);
      throw error;
    }
  }

  async getByCode(code: string): Promise<Country> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.get<Country>(`/countries/${code.toUpperCase()}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Pays non trouvé');
    } catch (error) {
      console.error('Erreur lors de la récupération du pays:', error);
      throw error;
    }
  }

  async create(countryData: Omit<Country, 'id'>): Promise<Country> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.post<Country>('/countries', countryData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la création du pays');
    } catch (error) {
      console.error('Erreur lors de la création du pays:', error);
      throw error;
    }
  }

  async update(id: number, countryData: Partial<Country>): Promise<Country> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.put<Country>(`/countries/${id}`, countryData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Échec de la mise à jour du pays');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pays:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      if (!apiClient.isOnline()) throw new Error('Backend non disponible');
      const response = await apiClient.delete(`/countries/${id}`);
      if (!response.success) {
        throw new Error('Échec de la suppression du pays');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du pays:', error);
      throw error;
    }
  }
}

export const countryService = new CountryService();