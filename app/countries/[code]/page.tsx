'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, CreditCard, Users, Star, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import countries from '@/data/countries.json';
import hotels from '@/data/hotels.json';
import restaurants from '@/data/restaurants.json';
import touristSites from '@/data/touristSites.json';
import { formatCurrency, convertCurrency, type Currency } from '@/lib/currency';

interface CountryPageProps {
  params: {
    code: string;
  };
}

// Generate static params for all countries
export async function generateStaticParams() {
  return countries.map((country) => ({
    code: country.code.toLowerCase(),
  }));
}

export default function CountryPage({ params }: CountryPageProps) {
  const [country, setCountry] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState('overview');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const foundCountry = countries.find(c => c.code.toLowerCase() === params.code.toLowerCase());
    setCountry(foundCountry);
  }, [params.code]);

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pays non trouvé</h1>
          <Button asChild>
            <Link href="/countries">Retour aux destinations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const countryHotels = hotels.filter(hotel => hotel.countryId === country.id);
  const countryRestaurants = restaurants.filter(restaurant => restaurant.countryId === country.id);
  const countrySites = touristSites.filter(site => site.countryId === country.id);

  const toggleFavorite = (type: string, id: number) => {
    const key = `${type}-${id}`;
    setFavorites(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const convertPrice = (amount: number, fromCurrency: Currency) => {
    return convertCurrency(amount, fromCurrency, selectedCurrency);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${country.image})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <Button
              asChild
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4 p-0"
            >
              <Link href="/countries" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux destinations
              </Link>
            </Button>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-6xl">{country.flag}</span>
              <div>
                <h1 className="text-5xl font-bold mb-2">{country.name}</h1>
                <p className="text-xl text-gray-200 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {country.continent} • {country.capital}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Badge variant={country.visaRequired ? "destructive" : "secondary"} className="text-sm">
                {country.visaRequired ? 'Visa requis' : 'Sans visa'}
              </Badge>
              <span className="text-lg">{country.language} • {country.currency}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Currency Selector */}
      <section className="py-4 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations détaillées
            </h2>
            <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR €</SelectItem>
                <SelectItem value="USD">USD $</SelectItem>
                <SelectItem value="XAF">XAF FCFA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="visa">Visa</TabsTrigger>
              <TabsTrigger value="accommodations">Hébergements</TabsTrigger>
              <TabsTrigger value="experiences">Expériences</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>À propos de {country.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {country.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Capitale:</strong> {country.capital}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Langue:</strong> {country.language}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Monnaie:</strong> {country.currency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            <strong>Saison:</strong> {country.popularSeason}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations pratiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Visa</h4>
                        <p className="text-sm text-blue-700">
                          {country.visaRequired 
                            ? `Visa requis • ${country.processingTime}`
                            : 'Aucun visa requis pour les séjours touristiques'
                          }
                        </p>
                        {country.visaRequired && (
                          <p className="text-sm text-blue-700 mt-1">
                            Coût: {formatCurrency(convertPrice(country.averageCost, 'EUR'), selectedCurrency)}
                          </p>
                        )}
                      </div>

                      {isAuthenticated && country.visaRequired && (
                        <Button asChild className="w-full">
                          <Link href={`/visa-steps?country=${country.code}`}>
                            Commencer ma demande de visa
                          </Link>
                        </Button>
                      )}

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Aperçu rapide</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-blue-600">{countryHotels.length}</div>
                            <div className="text-xs text-gray-600">Hôtels</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-green-600">{countryRestaurants.length}</div>
                            <div className="text-xs text-gray-600">Restaurants</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold text-purple-600">{countrySites.length}</div>
                            <div className="text-xs text-gray-600">Sites</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Visa Tab */}
            <TabsContent value="visa" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exigences de visa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {country.visaRequired ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-2">Visa requis</h4>
                          <p className="text-sm text-red-700">
                            Un visa est nécessaire pour entrer en {country.name}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Délai de traitement</span>
                            <Badge variant="outline">{country.processingTime}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Coût approximatif</span>
                            <Badge variant="outline">
                              {formatCurrency(convertPrice(country.averageCost, 'EUR'), selectedCurrency)}
                            </Badge>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-3">Documents requis</h4>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li>• Passeport valide (minimum 6 mois)</li>
                            <li>• Photo d'identité récente</li>
                            <li>• Formulaire de demande complété</li>
                            <li>• Justificatifs financiers</li>
                            <li>• Réservation d'hôtel</li>
                            <li>• Billet d'avion aller-retour</li>
                          </ul>
                        </div>

                        {isAuthenticated && (
                          <Button asChild className="w-full mt-4">
                            <Link href={`/visa-steps?country=${country.code}`}>
                              Commencer ma demande
                            </Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Aucun visa requis</h4>
                        <p className="text-sm text-green-700">
                          Vous pouvez voyager en {country.name} sans visa pour les séjours touristiques de courte durée.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processus de demande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {country.visaRequired ? (
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                            1
                          </div>
                          <div>
                            <h4 className="font-semibold">Préparation</h4>
                            <p className="text-sm text-gray-600">Rassemblez tous les documents requis</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                            2
                          </div>
                          <div>
                            <h4 className="font-semibold">Rendez-vous</h4>
                            <p className="text-sm text-gray-600">Prenez rendez-vous au consulat</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                            3
                          </div>
                          <div>
                            <h4 className="font-semibold">Soumission</h4>
                            <p className="text-sm text-gray-600">Soumettez votre dossier complet</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                            4
                          </div>
                          <div>
                            <h4 className="font-semibold">Suivi</h4>
                            <p className="text-sm text-gray-600">Suivez l'évolution de votre demande</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold mb-2">Voyage simplifié</h4>
                        <p className="text-sm text-gray-600">
                          Aucune démarche de visa nécessaire. Vous pouvez voyager librement !
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Accommodations Tab */}
            <TabsContent value="accommodations" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {countryHotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${hotel.image})` }}
                        />
                        <button
                          onClick={() => toggleFavorite('hotel', hotel.id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites[`hotel-${hotel.id}`] ? 'fill-red-500 text-red-500' : 'text-gray-600'
                            }`}
                          />
                        </button>
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: hotel.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{hotel.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {hotel.location}
                        </p>
                        <p className="text-sm text-gray-700 mb-4">
                          {hotel.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">
                              {formatCurrency(convertPrice(hotel.price, hotel.currency as Currency), selectedCurrency)}
                            </span>
                            <span className="text-sm text-gray-500">/nuit</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {hotel.amenities.slice(0, 3).map((amenity, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Experiences Tab */}
            <TabsContent value="experiences" className="mt-6">
              <div className="space-y-8">
                {/* Restaurants */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Restaurants recommandés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {countryRestaurants.map((restaurant, index) => (
                      <motion.div
                        key={restaurant.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <div className="flex">
                            <div className="relative w-32 h-32 overflow-hidden">
                              <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${restaurant.image})` }}
                              />
                            </div>
                            <CardContent className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-lg">{restaurant.name}</h4>
                                <button
                                  onClick={() => toggleFavorite('restaurant', restaurant.id)}
                                  className="p-1"
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      favorites[`restaurant-${restaurant.id}`] ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                    }`}
                                  />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {restaurant.location}
                              </p>
                              <p className="text-sm text-gray-700 mb-3">
                                {restaurant.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm">{restaurant.rating}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {restaurant.cuisine}
                                  </Badge>
                                </div>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(convertPrice(restaurant.averagePrice, restaurant.currency as Currency), selectedCurrency)}
                                </span>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tourist Sites */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Sites touristiques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countrySites.map((site, index) => (
                      <motion.div
                        key={site.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${site.image})` }}
                            />
                            <button
                              onClick={() => toggleFavorite('site', site.id)}
                              className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites[`site-${site.id}`] ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                              />
                            </button>
                            <div className="absolute bottom-3 left-3">
                              <Badge className="bg-white/90 text-gray-900">
                                {site.category}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-lg mb-2">{site.name}</h4>
                            <p className="text-sm text-gray-600 mb-2 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {site.location}
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                              {site.description}
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Durée recommandée</span>
                                <span className="font-medium">{site.visitDuration}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Meilleure période</span>
                                <span className="font-medium">{site.bestTime}</span>
                              </div>
                              {site.entryFee > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Entrée</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(convertPrice(site.entryFee, site.currency as Currency), selectedCurrency)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}