import { apiClient } from '@/lib/api';
import countriesData from '@/data/countries.json';

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

class CountryService {
  async getAll(): Promise<Country[]> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.get<Country[]>('/countries');
        
        if (response.success && response.data) {
          return response.data;
        }
      }
    } catch (error) {
      console.log('Récupération backend échouée, utilisation des données locales');
    }

    // Fallback sur les données locales
    return countriesData as Country[];
  }

  async getByCode(code: string): Promise<Country | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.get<Country>(`/countries/${code}`);
        
        if (response.success && response.data) {
          return response.data;
        }
      }
    } catch (error) {
      console.log('Récupération backend échouée, utilisation des données locales');
    }

    // Fallback sur les données locales
    return countriesData.find(c => c.code.toLowerCase() === code.toLowerCase()) || null;
  }

  async create(countryData: Omit<Country, 'id'>): Promise<Country | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.post<Country>('/countries', countryData);
        
        if (response.success && response.data) {
          return response.data;
        }
      }
    } catch (error) {
      console.log('Création backend échouée');
    }

    return null;
  }

  async update(id: number, countryData: Partial<Country>): Promise<Country | null> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.put<Country>(`/countries/${id}`, countryData);
        
        if (response.success && response.data) {
          return response.data;
        }
      }
    } catch (error) {
      console.log('Mise à jour backend échouée');
    }

    return null;
  }

  async delete(id: number): Promise<boolean> {
    try {
      if (apiClient.isOnline()) {
        const response = await apiClient.delete(`/countries/${id}`);
        return response.success;
      }
    } catch (error) {
      console.log('Suppression backend échouée');
    }

    return false;
  }
}

export const countryService = new CountryService();