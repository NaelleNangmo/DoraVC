// Configuration de l'API avec fallback automatique
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
}

export const apiClient = new ApiClient(API_BASE_URL);

// Hook pour vérifier le statut de connexion
export const useBackendStatus = () => {
  const [isOnline, setIsOnline] = useState(apiClient.isOnline());

  useEffect(() => {
    const checkStatus = async () => {
      const status = await apiClient.checkBackendHealth();
      setIsOnline(status);
    };

    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return isOnline;
};