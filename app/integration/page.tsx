'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Coffee, ShoppingBag, Home, Car, Phone, Wifi, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  distance: string;
  phone?: string;
  website?: string;
  description: string;
  image: string;
}

export default function IntegrationPage() {
  const [userLocation, setUserLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const categories = [
    { value: 'all', label: 'Tout', icon: MapPin },
    { value: 'restaurant', label: 'Restaurants', icon: Coffee },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'housing', label: 'Logement', icon: Home },
    { value: 'transport', label: 'Transport', icon: Car },
    { value: 'services', label: 'Services', icon: Phone },
  ];

  // Simulation de données locales (en production, utiliser une API comme Google Places)
  const mockPlaces: Place[] = [
    {
      id: '1',
      name: 'Restaurant Le Petit Paris',
      type: 'restaurant',
      address: '123 Rue de la Paix, Paris',
      rating: 4.5,
      distance: '0.2 km',
      phone: '+33 1 23 45 67 89',
      website: 'https://lepetitparis.fr',
      description: 'Cuisine française traditionnelle dans un cadre chaleureux',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      name: 'Carrefour City',
      type: 'shopping',
      address: '456 Avenue des Champs, Paris',
      rating: 4.2,
      distance: '0.5 km',
      phone: '+33 1 98 76 54 32',
      description: 'Supermarché avec tous les produits essentiels',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      name: 'Agence Immobilière Central',
      type: 'housing',
      address: '789 Boulevard Saint-Germain, Paris',
      rating: 4.0,
      distance: '0.8 km',
      phone: '+33 1 11 22 33 44',
      website: 'https://agence-central.fr',
      description: 'Spécialiste en location et vente immobilière',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      name: 'Station Métro République',
      type: 'transport',
      address: 'Place de la République, Paris',
      rating: 4.3,
      distance: '0.3 km',
      description: 'Station de métro avec connexions multiples',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      name: 'Poste Centrale',
      type: 'services',
      address: '321 Rue du Commerce, Paris',
      rating: 3.8,
      distance: '0.6 km',
      phone: '+33 1 55 66 77 88',
      description: 'Bureau de poste avec tous les services postaux',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Simuler la récupération de la localisation de l'utilisateur
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setUserLocation(savedLocation);
      loadNearbyPlaces(savedLocation);
    }
  }, [isAuthenticated]);

  const loadNearbyPlaces = async (location: string) => {
    setIsLoading(true);
    try {
      // En production, utiliser une API comme Google Places API
      // const response = await fetch(`/api/places?location=${location}&category=${selectedCategory}`);
      
      // Simulation avec des données mockées
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredPlaces = mockPlaces;
      if (selectedCategory !== 'all') {
        filteredPlaces = mockPlaces.filter(place => place.type === selectedCategory);
      }
      
      setPlaces(filteredPlaces);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
      toast.error('Erreur lors du chargement des lieux à proximité');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLocation.trim()) {
      localStorage.setItem('userLocation', userLocation);
      loadNearbyPlaces(userLocation);
      toast.success('Localisation mise à jour');
    }
  };

  const getCategoryIcon = (type: string) => {
    const category = categories.find(cat => cat.value === type);
    return category ? category.icon : MapPin;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg">
          <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Connexion requise
          </h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour accéder aux services d'intégration.
          </p>
          <Button asChild>
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Intégration dans votre nouveau pays
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Découvrez les services essentiels et les lieux d'intérêt près de chez vous
            </p>
          </div>
        </div>
      </section>

      {/* Location Input */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <form onSubmit={handleLocationSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Entrez votre adresse ou ville..."
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button type="submit" className="h-12 px-6">
                <Navigation className="h-4 w-4 mr-2" />
                Localiser
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    if (userLocation) {
                      loadNearbyPlaces(userLocation);
                    }
                  }}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Places Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {!userLocation ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Définissez votre localisation
              </h3>
              <p className="text-muted-foreground">
                Entrez votre adresse pour découvrir les services à proximité
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card className="h-80">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : places.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => {
                const Icon = getCategoryIcon(place.type);
                return (
                  <Card key={place.id} className="professional-card subtle-hover">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${place.image})` }}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-background/90 text-foreground">
                          <Icon className="h-3 w-3 mr-1" />
                          {categories.find(cat => cat.value === place.type)?.label}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          {place.rating}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{place.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {place.description}
                      </p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{place.address}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Navigation className="h-4 w-4 mr-2" />
                          <span>{place.distance}</span>
                        </div>
                        {place.phone && (
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{place.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Ouvrir dans Google Maps
                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`;
                            window.open(mapsUrl, '_blank');
                          }}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Itinéraire
                        </Button>
                        {place.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(place.website, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucun lieu trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier votre localisation ou vos filtres
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Integration Tips */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Conseils d'intégration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-primary" />
                    Logement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Visitez plusieurs quartiers avant de choisir</li>
                    <li>• Vérifiez les transports en commun</li>
                    <li>• Renseignez-vous sur les commerces de proximité</li>
                    <li>• Contactez les agences immobilières locales</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-primary" />
                    Services essentiels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ouvrez un compte bancaire local</li>
                    <li>• Souscrivez une assurance santé</li>
                    <li>• Inscrivez-vous à la mairie</li>
                    <li>• Trouvez un médecin généraliste</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-primary" />
                    Transport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Découvrez les options de transport public</li>
                    <li>• Obtenez une carte de transport</li>
                    <li>• Explorez les services de vélo en libre-service</li>
                    <li>• Renseignez-vous sur le permis de conduire local</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Vie sociale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Rejoignez des groupes d'expatriés</li>
                    <li>• Participez à des événements locaux</li>
                    <li>• Apprenez ou perfectionnez la langue locale</li>
                    <li>• Explorez la culture et les traditions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}