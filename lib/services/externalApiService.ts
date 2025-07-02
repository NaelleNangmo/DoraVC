// Service pour récupérer des données depuis des APIs externes
// Ceci évite de surcharger la base de données avec des informations dynamiques

interface PlaceSearchParams {
  location: string;
  category: string;
  radius?: number;
}

interface JobSearchParams {
  location: string;
  skills: string[];
  jobType: string;
}

interface UniversitySearchParams {
  country: string;
  field: string;
  level: string;
}

interface HousingSearchParams {
  location: string;
  type: string;
  budget: number;
}

class ExternalApiService {
  private readonly GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  private readonly INDEED_API_KEY = process.env.NEXT_PUBLIC_INDEED_API_KEY;

  // Recherche de lieux avec Google Places API
  async searchPlaces(params: PlaceSearchParams) {
    try {
      // En production, utiliser l'API Google Places
      if (this.GOOGLE_PLACES_API_KEY) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${params.location}&radius=${params.radius || 5000}&` +
          `type=${params.category}&key=${this.GOOGLE_PLACES_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          return this.transformPlacesData(data.results);
        }
      }
      
      // Fallback avec des données simulées
      return this.getMockPlaces(params);
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
      return this.getMockPlaces(params);
    }
  }

  // Recherche d'offres d'emploi
  async searchJobs(params: JobSearchParams) {
    try {
      // En production, utiliser des APIs comme Indeed, LinkedIn Jobs, etc.
      // const response = await fetch(`https://api.indeed.com/ads/apisearch?...`);
      
      // Fallback avec des données simulées
      return this.getMockJobs(params);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'emplois:', error);
      return this.getMockJobs(params);
    }
  }

  // Recherche d'universités
  async searchUniversities(params: UniversitySearchParams) {
    try {
      // En production, utiliser des APIs éducatives
      // const response = await fetch(`https://api.universitiesapi.com/search?...`);
      
      return this.getMockUniversities(params);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'universités:', error);
      return this.getMockUniversities(params);
    }
  }

  // Recherche de logements
  async searchHousing(params: HousingSearchParams) {
    try {
      // En production, utiliser des APIs immobilières
      // const response = await fetch(`https://api.rentals.com/search?...`);
      
      return this.getMockHousing(params);
    } catch (error) {
      console.error('Erreur lors de la recherche de logements:', error);
      return this.getMockHousing(params);
    }
  }

  // Récupération d'images depuis Unsplash
  async getImages(query: string, count: number = 10) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=demo`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.results.map((photo: any) => ({
          id: photo.id,
          url: photo.urls.regular,
          thumbnail: photo.urls.small,
          description: photo.description || photo.alt_description,
          photographer: photo.user.name
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération d\'images:', error);
    }
    
    return [];
  }

  // Données simulées pour les lieux
  private getMockPlaces(params: PlaceSearchParams) {
    const mockData = [
      {
        id: '1',
        name: 'Restaurant Local',
        type: params.category,
        address: `123 Rue Principale, ${params.location}`,
        rating: 4.5,
        distance: '0.2 km',
        phone: '+33 1 23 45 67 89',
        description: 'Excellent restaurant local avec cuisine traditionnelle',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
      },
      {
        id: '2',
        name: 'Supermarché Central',
        type: params.category,
        address: `456 Avenue Commerce, ${params.location}`,
        rating: 4.2,
        distance: '0.5 km',
        phone: '+33 1 98 76 54 32',
        description: 'Supermarché avec tous les produits essentiels',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      }
    ];
    
    return mockData;
  }

  // Données simulées pour les emplois
  private getMockJobs(params: JobSearchParams) {
    return [
      {
        id: '1',
        title: 'Développeur Full Stack',
        company: 'TechCorp',
        location: params.location,
        salary: '45000-55000 EUR',
        type: params.jobType,
        description: 'Poste de développeur avec expertise en React et Node.js',
        requirements: params.skills,
        posted: '2024-01-15',
        url: 'https://example.com/job/1'
      },
      {
        id: '2',
        title: 'Chef de Projet',
        company: 'Innovation Ltd',
        location: params.location,
        salary: '50000-60000 EUR',
        type: params.jobType,
        description: 'Gestion de projets technologiques innovants',
        requirements: ['Gestion de projet', 'Leadership'],
        posted: '2024-01-10',
        url: 'https://example.com/job/2'
      }
    ];
  }

  // Données simulées pour les universités
  private getMockUniversities(params: UniversitySearchParams) {
    return [
      {
        id: '1',
        name: 'Université Centrale',
        location: `Capitale, ${params.country}`,
        ranking: 15,
        field: params.field,
        level: params.level,
        tuition: '8000 EUR/an',
        admissionDeadline: '2024-03-15',
        requirements: ['Baccalauréat', 'Test de langue', 'Lettre de motivation'],
        scholarships: ['Bourse mérite', 'Bourse internationale'],
        website: 'https://universite-centrale.edu'
      },
      {
        id: '2',
        name: 'Institut Technologique',
        location: `Ville Tech, ${params.country}`,
        ranking: 25,
        field: params.field,
        level: params.level,
        tuition: '12000 EUR/an',
        admissionDeadline: '2024-04-01',
        requirements: ['Diplôme technique', 'Portfolio', 'Entretien'],
        scholarships: ['Bourse excellence'],
        website: 'https://institut-tech.edu'
      }
    ];
  }

  // Données simulées pour les logements
  private getMockHousing(params: HousingSearchParams) {
    return [
      {
        id: '1',
        title: 'Appartement 2 pièces centre-ville',
        type: params.type,
        location: params.location,
        price: Math.min(params.budget * 0.8, 1200),
        size: '45 m²',
        rooms: 2,
        description: 'Appartement lumineux en centre-ville avec toutes commodités',
        amenities: ['Cuisine équipée', 'Balcon', 'Parking'],
        images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'],
        contact: 'agence@immobilier.com',
        available: '2024-02-01'
      },
      {
        id: '2',
        title: 'Studio moderne quartier étudiant',
        type: params.type,
        location: params.location,
        price: Math.min(params.budget * 0.6, 800),
        size: '25 m²',
        rooms: 1,
        description: 'Studio parfait pour étudiant, proche transports',
        amenities: ['Meublé', 'Internet inclus', 'Laverie'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
        contact: 'contact@student-housing.com',
        available: '2024-01-15'
      }
    ];
  }

  // Transformation des données Google Places
  private transformPlacesData(places: any[]) {
    return places.map(place => ({
      id: place.place_id,
      name: place.name,
      type: place.types[0],
      address: place.vicinity,
      rating: place.rating || 0,
      distance: 'N/A', // Calculer avec la géolocalisation
      phone: place.formatted_phone_number,
      description: place.editorial_summary?.overview || 'Aucune description disponible',
      image: place.photos?.[0] ? 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.GOOGLE_PLACES_API_KEY}` :
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    }));
  }
}

export const externalApiService = new ExternalApiService();

// Guide d'utilisation des APIs externes :

/*
1. GOOGLE PLACES API (pour les lieux)
   - Inscription : https://console.cloud.google.com/
   - Activer Places API
   - Créer une clé API
   - Ajouter NEXT_PUBLIC_GOOGLE_PLACES_API_KEY dans .env

2. INDEED API (pour les emplois)
   - Inscription : https://ads.indeed.com/jobroll/xmlfeed
   - Obtenir une clé API
   - Ajouter NEXT_PUBLIC_INDEED_API_KEY dans .env

3. UNSPLASH API (pour les images)
   - Inscription : https://unsplash.com/developers
   - Créer une application
   - Utiliser la clé d'accès

4. AUTRES APIs UTILES :
   - OpenWeatherMap (météo)
   - REST Countries (informations pays)
   - World Bank API (données économiques)
   - Universities API (universités mondiales)

5. CONFIGURATION .env :
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
   NEXT_PUBLIC_INDEED_API_KEY=your_key_here
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here
   NEXT_PUBLIC_WEATHER_API_KEY=your_key_here

6. GESTION DES QUOTAS :
   - Implémenter un cache Redis/localStorage
   - Limiter les requêtes par utilisateur
   - Utiliser des fallbacks avec données mockées
   - Monitorer l'utilisation des APIs

7. SÉCURITÉ :
   - Ne jamais exposer les clés secrètes côté client
   - Utiliser des proxies API côté serveur pour les clés sensibles
   - Implémenter une authentification pour les APIs payantes
   - Valider et nettoyer toutes les données reçues
*/