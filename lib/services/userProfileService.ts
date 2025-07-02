// Service pour gérer les profils utilisateurs et leurs préférences
// Ceci permet de personnaliser l'expérience selon le statut et les besoins

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
    // Pour les travailleurs
    skills?: string[];
    experience?: string;
    jobType?: 'full-time' | 'part-time' | 'freelance';
    
    // Pour les étudiants
    field?: string;
    level?: 'bachelor' | 'master' | 'phd';
    budget?: number;
    
    // Pour les résidents
    familySize?: number;
    housingType?: 'apartment' | 'house' | 'studio';
    
    // Général
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
  private readonly STORAGE_KEY = 'userProfile';

  // Récupérer le profil utilisateur complet
  getUserProfile(userId: number): UserProfile | null {
    try {
      const profiles = this.getAllProfiles();
      return profiles.find(p => p.id === userId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  // Mettre à jour le profil utilisateur
  updateUserProfile(userId: number, updates: Partial<UserProfile>): boolean {
    try {
      const profiles = this.getAllProfiles();
      const profileIndex = profiles.findIndex(p => p.id === userId);
      
      if (profileIndex === -1) {
        // Créer un nouveau profil
        const newProfile: UserProfile = {
          id: userId,
          name: updates.name || '',
          email: updates.email || '',
          role: updates.role || 'user',
          status: updates.status || 'tourist',
          preferences: {
            language: 'fr',
            currency: 'EUR',
            notifications: true,
            ...updates.preferences
          },
          profile: updates.profile || {},
          visaApplications: [],
          savedPlaces: [],
          integrationProgress: {
            completedTasks: [],
            essentialServices: {
              banking: false,
              healthcare: false,
              housing: false,
              transport: false,
              documentation: false
            },
            socialIntegration: {
              languageCourse: false,
              communityGroups: false,
              localEvents: false,
              networking: false
            }
          },
          ...updates
        };
        profiles.push(newProfile);
      } else {
        // Mettre à jour le profil existant
        profiles[profileIndex] = {
          ...profiles[profileIndex],
          ...updates,
          preferences: {
            ...profiles[profileIndex].preferences,
            ...updates.preferences
          },
          profile: {
            ...profiles[profileIndex].profile,
            ...updates.profile
          }
        };
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }
  }

  // Ajouter une demande de visa
  addVisaApplication(userId: number, application: Omit<VisaApplication, 'id'>): string | null {
    try {
      const profile = this.getUserProfile(userId);
      if (!profile) return null;

      const newApplication: VisaApplication = {
        id: Date.now().toString(),
        ...application
      };

      profile.visaApplications.push(newApplication);
      this.updateUserProfile(userId, { visaApplications: profile.visaApplications });
      
      return newApplication.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la demande de visa:', error);
      return null;
    }
  }

  // Mettre à jour une demande de visa
  updateVisaApplication(userId: number, applicationId: string, updates: Partial<VisaApplication>): boolean {
    try {
      const profile = this.getUserProfile(userId);
      if (!profile) return false;

      const appIndex = profile.visaApplications.findIndex(app => app.id === applicationId);
      if (appIndex === -1) return false;

      profile.visaApplications[appIndex] = {
        ...profile.visaApplications[appIndex],
        ...updates
      };

      return this.updateUserProfile(userId, { visaApplications: profile.visaApplications });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la demande de visa:', error);
      return false;
    }
  }

  // Sauvegarder un lieu
  savePlace(userId: number, place: Omit<SavedPlace, 'id' | 'savedAt'>): boolean {
    try {
      const profile = this.getUserProfile(userId);
      if (!profile) return false;

      const newPlace: SavedPlace = {
        id: Date.now().toString(),
        savedAt: new Date(),
        ...place
      };

      profile.savedPlaces.push(newPlace);
      return this.updateUserProfile(userId, { savedPlaces: profile.savedPlaces });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du lieu:', error);
      return false;
    }
  }

  // Supprimer un lieu sauvegardé
  removeSavedPlace(userId: number, placeId: string): boolean {
    try {
      const profile = this.getUserProfile(userId);
      if (!profile) return false;

      profile.savedPlaces = profile.savedPlaces.filter(place => place.id !== placeId);
      return this.updateUserProfile(userId, { savedPlaces: profile.savedPlaces });
    } catch (error) {
      console.error('Erreur lors de la suppression du lieu:', error);
      return false;
    }
  }

  // Mettre à jour le progrès d'intégration
  updateIntegrationProgress(userId: number, updates: Partial<IntegrationProgress>): boolean {
    try {
      const profile = this.getUserProfile(userId);
      if (!profile) return false;

      profile.integrationProgress = {
        ...profile.integrationProgress,
        ...updates,
        essentialServices: {
          ...profile.integrationProgress.essentialServices,
          ...updates.essentialServices
        },
        socialIntegration: {
          ...profile.integrationProgress.socialIntegration,
          ...updates.socialIntegration
        }
      };

      return this.updateUserProfile(userId, { integrationProgress: profile.integrationProgress });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du progrès d\'intégration:', error);
      return false;
    }
  }

  // Obtenir des recommandations personnalisées
  getPersonalizedRecommendations(userId: number, countryCode: string) {
    const profile = this.getUserProfile(userId);
    if (!profile) return null;

    const recommendations = {
      jobs: [],
      universities: [],
      housing: [],
      places: [],
      integrationTips: []
    };

    // Recommandations basées sur le statut
    switch (profile.status) {
      case 'worker':
        recommendations.integrationTips.push(
          'Recherchez des groupes professionnels dans votre domaine',
          'Inscrivez-vous aux événements de networking locaux',
          'Explorez les opportunités de formation continue'
        );
        break;
      
      case 'student':
        recommendations.integrationTips.push(
          'Rejoignez les associations étudiantes',
          'Participez aux événements d\'orientation',
          'Explorez les programmes d\'échange culturel'
        );
        break;
      
      case 'resident':
        recommendations.integrationTips.push(
          'Inscrivez-vous aux services municipaux',
          'Explorez les activités communautaires',
          'Apprenez les traditions locales'
        );
        break;
      
      default: // tourist
        recommendations.integrationTips.push(
          'Découvrez les sites touristiques incontournables',
          'Goûtez à la cuisine locale',
          'Apprenez quelques phrases de base'
        );
    }

    // Recommandations basées sur les intérêts
    if (profile.profile.interests) {
      profile.profile.interests.forEach(interest => {
        recommendations.places.push(`Lieux liés à ${interest}`);
      });
    }

    return recommendations;
  }

  // Calculer le score de compatibilité avec un pays
  calculateCountryCompatibility(userId: number, countryCode: string): number {
    const profile = this.getUserProfile(userId);
    if (!profile) return 0;

    let score = 50; // Score de base

    // Facteurs positifs
    if (profile.profile.travelHistory?.includes(countryCode)) {
      score += 20; // Déjà visité
    }

    if (profile.preferences.language === 'en' && ['US', 'GB', 'AU', 'CA'].includes(countryCode)) {
      score += 15; // Langue compatible
    }

    if (profile.preferences.language === 'fr' && ['FR', 'CA', 'SN', 'ML'].includes(countryCode)) {
      score += 15; // Langue compatible
    }

    // Facteurs basés sur le statut
    switch (profile.status) {
      case 'student':
        if (['US', 'GB', 'CA', 'FR', 'DE'].includes(countryCode)) {
          score += 10; // Pays avec bonnes universités
        }
        break;
      
      case 'worker':
        if (['US', 'GB', 'CA', 'DE', 'AU'].includes(countryCode)) {
          score += 10; // Pays avec bonnes opportunités d'emploi
        }
        break;
    }

    return Math.min(100, Math.max(0, score));
  }

  // Méthodes privées
  private getAllProfiles(): UserProfile[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des profils:', error);
      return [];
    }
  }
}

export const userProfileService = new UserProfileService();