import React, { useState, useEffect } from 'react';

// Configuration de l'API avec fallback automatique
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface VisaCheckParams {
  origin: string;
  destination: string;
  type?: string;
}

interface LocationParams {
  lat: number;
  lng: number;
  radius?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private isBackendAvailable: boolean = true;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.checkBackendHealth();
  }

  private async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 secondes timeout
      });
      
      this.isBackendAvailable = response.ok;
      return this.isBackendAvailable;
    } catch (error) {
      console.log('Backend non disponible, utilisation des données locales');
      this.isBackendAvailable = false;
      return false;
    }
  }

  public async getBackendHealth(): Promise<boolean> {
    return this.checkBackendHealth();
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Vérifier la disponibilité du backend
      if (!this.isBackendAvailable) {
        await this.checkBackendHealth();
      }

      if (!this.isBackendAvailable) {
        throw new Error('Backend non disponible');
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: AbortSignal.timeout(10000) // 10 secondes timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erreur API ${endpoint}:`, error);
      this.isBackendAvailable = false;
      throw error;
    }
  }

  // Méthodes utilitaires
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  isOnline(): boolean {
    return this.isBackendAvailable;
  }

  // Méthodes spécialisées pour DORA
  async checkVisaRequirement(params: VisaCheckParams) {
    try {
      if (this.isBackendAvailable) {
        const queryParams = new URLSearchParams({
          origin: params.origin,
          destination: params.destination,
          type: params.type || 'tourist'
        });
        
        const response = await this.get(`/visa/check?${queryParams}`);
        if (response.success) return response.data;
      }
    } catch (error) {
      console.log('Vérification visa backend échouée, utilisation des données locales');
      this.isBackendAvailable = false;
    }
    
    // Fallback avec logique locale existante
    return this.getLocalVisaRequirement(params.origin, params.destination);
  }

  async getCountryImages(countryCode: string, category?: string, limit: number = 10) {
    try {
      if (this.isBackendAvailable) {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        params.append('limit', limit.toString());
        
        const response = await this.get(`/countries/${countryCode}/images?${params}`);
        if (response.success) return response.data;
      }
    } catch (error) {
      this.isBackendAvailable = false;
    }
    
    // Fallback avec images par défaut
    return this.getDefaultImages(countryCode, category);
  }

  async getUserApplications() {
    try {
      if (this.isBackendAvailable) {
        const response = await this.get('/applications');
        if (response.success) return response.data;
      }
    } catch (error) {
      this.isBackendAvailable = false;
    }
    
    // Fallback localStorage
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('visaApplications') || '[]');
    }
    return [];
  }

  async createApplication(applicationData: any) {
    try {
      if (this.isBackendAvailable) {
        const response = await this.post('/applications', applicationData);
        if (response.success) return response.data;
      }
    } catch (error) {
      this.isBackendAvailable = false;
    }
    
    // Fallback localStorage
    if (typeof window !== 'undefined') {
      const applications = JSON.parse(localStorage.getItem('visaApplications') || '[]');
      const newApp = { 
        id: Date.now(), 
        ...applicationData, 
        status: 'draft',
        current_step: 1,
        progress_percentage: 0,
        created_at: new Date().toISOString() 
      };
      applications.push(newApp);
      localStorage.setItem('visaApplications', JSON.stringify(applications));
      return newApp;
    }
    return null;
  }

  async getIntegrationServices(countryCode: string, type?: string, location?: LocationParams) {
    try {
      if (this.isBackendAvailable) {
        const params = new URLSearchParams({ country: countryCode });
        if (type) params.append('type', type);
        if (location) {
          params.append('lat', location.lat.toString());
          params.append('lng', location.lng.toString());
          params.append('radius', (location.radius || 5000).toString());
        }
        
        const response = await this.get(`/integration/services?${params}`);
        if (response.success) return response.data;
      }
    } catch (error) {
      this.isBackendAvailable = false;
    }
    
    // Fallback avec données mockées
    return this.getMockIntegrationServices(countryCode, type);
  }

  async getUserLocation() {
    try {
      if (this.isBackendAvailable) {
        const response = await this.get('/users/location');
        if (response.success) return response.data;
      }
    } catch (error) {
      this.isBackendAvailable = false;
    }
    
    // Fallback localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userLocation');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }

  async setUserLocation(locationData: any) {
    try {
      if (this.isBackendAvailable) {
        const response = await this.post('/users/location', locationData);
        if (response.success) return response.data;
      }
    } catch (error) {
      this.isBackendAvailable = false;
    }
    
    // Fallback localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLocation', JSON.stringify(locationData));
    }
    return locationData;
  }

  // Méthodes de fallback privées
  private getLocalVisaRequirement(origin: string, destination: string) {
    // Logique existante de vérification visa locale
    const exemptCountries = {
      'FR': ['SN', 'ML', 'CI', 'BF', 'MA', 'TN', 'JP', 'BR'],
      'SN': ['ML', 'CI', 'BF', 'FR'],
      'ML': ['SN', 'CI', 'BF', 'FR'],
      'JP': ['FR', 'US', 'BR', 'SN', 'ML']
    };

    const originExemptions = exemptCountries[origin as keyof typeof exemptCountries] || [];
    const isExempt = originExemptions.includes(destination);

    return {
      visa_required: !isExempt,
      max_stay_days: isExempt ? 90 : null,
      processing_time: isExempt ? null : '10-15 jours',
      cost_usd: isExempt ? 0 : 100,
      requirements: isExempt ? 
        ['Passeport valide 6 mois', 'Billet retour'] : 
        ['Passeport valide 6 mois', 'Formulaire visa', 'Photos', 'Justificatifs financiers']
    };
  }

  private getDefaultImages(countryCode: string, category?: string) {
    // Images par défaut par pays
    const defaultImages = {
      'FR': [
        { id: 1, title: 'Tour Eiffel', url: 'https://images.unsplash.com/photo-1549144511-f099e773c147', category: 'tourist_site' },
        { id: 2, title: 'Louvre', url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a', category: 'tourist_site' }
      ],
      'JP': [
        { id: 3, title: 'Mont Fuji', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', category: 'nature' },
        { id: 4, title: 'Tokyo', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e', category: 'city' }
      ]
    };

    const countryImages = defaultImages[countryCode as keyof typeof defaultImages] || [];
    return category ? countryImages.filter(img => img.category === category) : countryImages;
  }

  private getMockIntegrationServices(countryCode: string, type?: string) {
    const mockServices = [
      {
        id: 1,
        name: 'Restaurant Local',
        type: 'restaurant',
        address: `123 Rue Principale, ${countryCode}`,
        rating: 4.5,
        distance: '0.2 km',
        phone: '+33 1 23 45 67 89',
        description: 'Excellent restaurant local avec cuisine traditionnelle',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
      },
      {
        id: 2,
        name: 'Supermarché Central',
        type: 'shopping',
        address: `456 Avenue Commerce, ${countryCode}`,
        rating: 4.2,
        distance: '0.5 km',
        phone: '+33 1 98 76 54 32',
        description: 'Supermarché avec tous les produits essentiels',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      }
    ];

    return type ? mockServices.filter(service => service.type === type) : mockServices;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Hook pour vérifier le statut de connexion
export const useBackendStatus = () => {
  const [isOnline, setIsOnline] = useState(apiClient.isOnline());

  useEffect(() => {
    const checkStatus = async () => {
      const status = await apiClient.getBackendHealth();
      setIsOnline(status);
    };

    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return isOnline;
};