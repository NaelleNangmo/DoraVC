import { apiClient } from '@/lib/api';

export interface VisaApplication {
  id: number;
  user_id: number;
  country_code: string;
  country_name?: string;
  application_type: 'tourist' | 'student' | 'worker' | 'resident';
  status: 'draft' | 'in_progress' | 'submitted' | 'processing' | 'approved' | 'rejected' | 'expired';
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  
  // Données du formulaire
  personal_info: {
    firstName?: string;
    lastName?: string;
    nationality?: string;
    passportNumber?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
  };
  
  travel_info: {
    purpose?: string;
    duration?: string;
    accommodation?: string;
    financialProof?: string;
  };
  
  documents_info: {
    passport?: boolean;
    photos?: boolean;
    bankStatement?: boolean;
    invitation?: boolean;
  };
  
  additional_info: Record<string, any>;
  
  // Dates
  started_at: string;
  submitted_at?: string;
  expected_decision_date?: string;
  decision_date?: string;
  visa_expiry_date?: string;
  
  // Coûts
  estimated_cost?: number;
  actual_cost?: number;
  currency: string;
  
  // Suivi
  reference_number?: string;
  consulate_location?: string;
  appointment_date?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationData {
  countryCode: string;
  applicationType: 'tourist' | 'student' | 'worker' | 'resident';
  personalInfo?: Partial<VisaApplication['personal_info']>;
  travelInfo?: Partial<VisaApplication['travel_info']>;
}

class ApplicationService {
  async getApplications(): Promise<VisaApplication[]> {
    try {
      const response = await apiClient.get<VisaApplication[]>('/applications');
      if (response.success && response.data) {
        // Mettre à jour le cache local
        if (typeof window !== 'undefined') {
          localStorage.setItem('visaApplications', JSON.stringify(response.data));
        }
        return response.data;
      }
    } catch (error) {
      console.log('Backend indisponible, utilisation des données locales');
    }
    
    // Fallback localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('visaApplications');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }
  
  async getApplication(id: number): Promise<VisaApplication | null> {
    try {
      const response = await apiClient.get<VisaApplication>(`/applications/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.log('Backend indisponible, recherche locale');
    }
    
    // Fallback localStorage
    const applications = await this.getApplications();
    return applications.find(app => app.id === id) || null;
  }
  
  async createApplication(data: CreateApplicationData): Promise<VisaApplication> {
    const applicationData = {
      country_code: data.countryCode,
      application_type: data.applicationType,
      personal_info: data.personalInfo || {},
      travel_info: data.travelInfo || {},
      documents_info: {},
      additional_info: {}
    };
    
    try {
      const response = await apiClient.post<VisaApplication>('/applications', applicationData);
      if (response.success && response.data) {
        // Mettre à jour le cache local
        const applications = await this.getApplications();
        const updatedApplications = [response.data, ...applications];
        if (typeof window !== 'undefined') {
          localStorage.setItem('visaApplications', JSON.stringify(updatedApplications));
        }
        return response.data;
      }
    } catch (error) {
      console.log('Création backend échouée, sauvegarde locale');
    }
    
    // Fallback localStorage
    const newApp: VisaApplication = {
      id: Date.now(),
      user_id: 1, // ID utilisateur par défaut
      country_code: data.countryCode,
      application_type: data.applicationType,
      status: 'draft',
      current_step: 1,
      total_steps: 5,
      progress_percentage: 0,
      personal_info: data.personalInfo || {},
      travel_info: data.travelInfo || {},
      documents_info: {},
      additional_info: {},
      currency: 'EUR',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const applications = await this.getApplications();
    const updatedApplications = [newApp, ...applications];
    if (typeof window !== 'undefined') {
      localStorage.setItem('visaApplications', JSON.stringify(updatedApplications));
    }
    return newApp;
  }
  
  async updateApplication(id: number, updates: Partial<VisaApplication>): Promise<VisaApplication> {
    try {
      const response = await apiClient.put<VisaApplication>(`/applications/${id}`, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      if (response.success && response.data) {
        // Mettre à jour le cache local
        const applications = await this.getApplications();
        const updatedApplications = applications.map(app => 
          app.id === id ? response.data! : app
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem('visaApplications', JSON.stringify(updatedApplications));
        }
        return response.data;
      }
    } catch (error) {
      console.log('Mise à jour backend échouée, mise à jour locale');
    }
    
    // Fallback localStorage
    const applications = await this.getApplications();
    const index = applications.findIndex(app => app.id === id);
    if (index !== -1) {
      applications[index] = { 
        ...applications[index], 
        ...updates,
        updated_at: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('visaApplications', JSON.stringify(applications));
      }
      return applications[index];
    }
    
    throw new Error('Application non trouvée');
  }
  
  async deleteApplication(id: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/applications/${id}`);
      if (response.success) {
        // Mettre à jour le cache local
        const applications = await this.getApplications();
        const updatedApplications = applications.filter(app => app.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('visaApplications', JSON.stringify(updatedApplications));
        }
        return true;
      }
    } catch (error) {
      console.log('Suppression backend échouée, suppression locale');
    }
    
    // Fallback localStorage
    const applications = await this.getApplications();
    const updatedApplications = applications.filter(app => app.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('visaApplications', JSON.stringify(updatedApplications));
    }
    return true;
  }
  
  async updateApplicationStep(id: number, step: number, stepData?: any): Promise<VisaApplication> {
    const updates: Partial<VisaApplication> = {
      current_step: step,
      progress_percentage: Math.round((step / 5) * 100)
    };
    
    if (stepData) {
      updates.additional_info = stepData;
    }
    
    if (step === 5) {
      updates.status = 'submitted';
      updates.submitted_at = new Date().toISOString();
    } else if (step > 1) {
      updates.status = 'in_progress';
    }
    
    return this.updateApplication(id, updates);
  }
  
  async uploadDocument(applicationId: number, documentType: string, file: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      
      const response = await fetch(`${apiClient['baseURL']}/applications/${applicationId}/documents`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.log('Upload backend échoué, simulation locale');
    }
    
    // Fallback - simuler l'upload
    const application = await this.getApplication(applicationId);
    if (application) {
      const updatedDocuments = {
        ...application.documents_info,
        [documentType]: true
      };
      
      await this.updateApplication(applicationId, {
        documents_info: updatedDocuments
      });
      return true;
    }
    
    return false;
  }
  
  // Méthodes utilitaires
  getApplicationsByStatus(status: VisaApplication['status']): Promise<VisaApplication[]> {
    return this.getApplications().then(apps => 
      apps.filter(app => app.status === status)
    );
  }
  
  getApplicationsByCountry(countryCode: string): Promise<VisaApplication[]> {
    return this.getApplications().then(apps => 
      apps.filter(app => app.country_code === countryCode)
    );
  }
  
  getApplicationsByType(type: VisaApplication['application_type']): Promise<VisaApplication[]> {
    return this.getApplications().then(apps => 
      apps.filter(app => app.application_type === type)
    );
  }
}

export const applicationService = new ApplicationService();