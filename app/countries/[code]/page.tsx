'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, CreditCard, Users, Star, Heart, ExternalLink, Briefcase, GraduationCap, Home, Camera } from 'lucide-react';
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
import { externalApiService } from '@/lib/services/externalApiService';

interface CountryPageProps {
  params: {
    code: string;
  };
}

export default function CountryPage({ params }: CountryPageProps) {
  const [country, setCountry] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [userStatus, setUserStatus] = useState('tourist'); // tourist, worker, student, resident
  const [jobs, setJobs] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [housing, setHousing] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const foundCountry = countries.find(c => c.code.toLowerCase() === params.code.toLowerCase());
    setCountry(foundCountry);
    
    if (foundCountry) {
      loadDynamicContent(foundCountry);
      loadUserExperiences(foundCountry.id);
    }
  }, [params.code]);

  const loadDynamicContent = async (country: any) => {
    try {
      // Charger les données selon le statut de l'utilisateur
      if (userStatus === 'worker') {
        const jobData = await externalApiService.searchJobs({
          location: country.name,
          skills: user?.skills || ['Développement', 'Marketing'],
          jobType: 'full-time'
        });
        setJobs(jobData);
      }
      
      if (userStatus === 'student') {
        const uniData = await externalApiService.searchUniversities({
          country: country.name,
          field: user?.field || 'Informatique',
          level: 'master'
        });
        setUniversities(uniData);
      }
      
      if (userStatus === 'resident') {
        const housingData = await externalApiService.searchHousing({
          location: country.name,
          type: 'apartment',
          budget: 1500
        });
        setHousing(housingData);
      }
      
      // Charger la galerie d'images
      const images = await externalApiService.getImages(`${country.name} tourism`, 12);
      setGallery(images);
      
    } catch (error) {
      console.error('Erreur lors du chargement du contenu dynamique:', error);
    }
  };

  const loadUserExperiences = (countryId: number) => {
    // Charger les expériences utilisateurs validées par l'admin
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const countryExperiences = posts.filter((post: any) => 
        post.countryId === countryId && post.status === 'approved'
      );
      setExperiences(countryExperiences);
    }
  };

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Pays non trouvé</h1>
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${country.image})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
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
          </div>
        </div>
      </section>

      {/* Status Selector & Currency */}
      <section className="py-4 bg-muted/30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-foreground">
                Votre statut :
              </h2>
              <Select value={userStatus} onValueChange={(value) => {
                setUserStatus(value);
                loadDynamicContent(country);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">🏖️ Touriste</SelectItem>
                  <SelectItem value="worker">💼 Travailleur</SelectItem>
                  <SelectItem value="student">🎓 Étudiant</SelectItem>
                  <SelectItem value="resident">🏠 Résident permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="visa">Visa</TabsTrigger>
              <TabsTrigger value="specific">
                {userStatus === 'tourist' && 'Tourisme'}
                {userStatus === 'worker' && 'Emploi'}
                {userStatus === 'student' && 'Études'}
                {userStatus === 'resident' && 'Logement'}
              </TabsTrigger>
              <TabsTrigger value="experiences">Expériences</TabsTrigger>
              <TabsTrigger value="gallery">Galerie</TabsTrigger>
              <TabsTrigger value="accommodations">Hébergements</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="professional-card">
                    <CardHeader>
                      <CardTitle>À propos de {country.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {country.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Capitale:</strong> {country.capital}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Langue:</strong> {country.language}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Monnaie:</strong> {country.currency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Saison:</strong> {country.popularSeason}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="professional-card">
                    <CardHeader>
                      <CardTitle>Informations pratiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">Visa</h4>
                        <p className="text-sm text-muted-foreground">
                          {country.visaRequired 
                            ? `Visa requis • ${country.processingTime}`
                            : 'Aucun visa requis pour les séjours touristiques'
                          }
                        </p>
                        {country.visaRequired && (
                          <p className="text-sm text-muted-foreground mt-1">
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
                          <div className="p-2 bg-muted rounded">
                            <div className="text-lg font-bold text-primary">{countryHotels.length}</div>
                            <div className="text-xs text-muted-foreground">Hôtels</div>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <div className="text-lg font-bold text-primary">{countryRestaurants.length}</div>
                            <div className="text-xs text-muted-foreground">Restaurants</div>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <div className="text-lg font-bold text-primary">{countrySites.length}</div>
                            <div className="text-xs text-muted-foreground">Sites</div>
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
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle>Exigences de visa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {country.visaRequired ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-destructive/10 rounded-lg">
                          <h4 className="font-semibold text-destructive mb-2">Visa requis</h4>
                          <p className="text-sm text-muted-foreground">
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
                          <ul className="space-y-2 text-sm text-muted-foreground">
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
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">Aucun visa requis</h4>
                        <p className="text-sm text-muted-foreground">
                          Vous pouvez voyager en {country.name} sans visa pour les séjours touristiques de courte durée.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle>Processus de demande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {country.visaRequired ? (
                      <div className="space-y-4">
                        {[
                          { step: 1, title: 'Préparation', desc: 'Rassemblez tous les documents requis' },
                          { step: 2, title: 'Rendez-vous', desc: 'Prenez rendez-vous au consulat' },
                          { step: 3, title: 'Soumission', desc: 'Soumettez votre dossier complet' },
                          { step: 4, title: 'Suivi', desc: 'Suivez l\'évolution de votre demande' }
                        ].map((item) => (
                          <div key={item.step} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {item.step}
                            </div>
                            <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2">Voyage simplifié</h4>
                        <p className="text-sm text-muted-foreground">
                          Aucune démarche de visa nécessaire. Vous pouvez voyager librement !
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Status-specific Tab */}
            <TabsContent value="specific" className="mt-6">
              {userStatus === 'tourist' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {countrySites.map((site) => (
                    <Card key={site.id} className="professional-card subtle-hover">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${site.image})` }}
                        />
                        <button
                          onClick={() => toggleFavorite('site', site.id)}
                          className="absolute top-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites[`site-${site.id}`] ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-background/90 text-foreground">
                            {site.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{site.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {site.location}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {site.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Durée recommandée</span>
                            <span className="font-medium">{site.visitDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Meilleure période</span>
                            <span className="font-medium">{site.bestTime}</span>
                          </div>
                          {site.entryFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Entrée</span>
                              <span className="font-medium text-primary">
                                {formatCurrency(convertPrice(site.entryFee, site.currency as Currency), selectedCurrency)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {userStatus === 'worker' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Briefcase className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Opportunités d'emploi en {country.name}</h2>
                    <p className="text-muted-foreground">Découvrez les offres d'emploi qui correspondent à votre profil</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                      <Card key={job.id} className="professional-card">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <p className="text-muted-foreground">{job.company}</p>
                            </div>
                            <Badge variant="outline">{job.type}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Localisation</span>
                              <span>{job.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Salaire</span>
                              <span className="font-medium text-primary">{job.salary}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Publié le</span>
                              <span>{new Date(job.posted).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.requirements.map((req: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                          
                          <Button className="w-full" onClick={() => window.open(job.url, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Voir l'offre
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {userStatus === 'student' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Universités en {country.name}</h2>
                    <p className="text-muted-foreground">Trouvez l'université parfaite pour vos études</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {universities.map((uni) => (
                      <Card key={uni.id} className="professional-card">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{uni.name}</h3>
                              <p className="text-muted-foreground">{uni.location}</p>
                            </div>
                            <Badge variant="outline">Rang #{uni.ranking}</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Domaine</span>
                              <span>{uni.field}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Niveau</span>
                              <span>{uni.level}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frais de scolarité</span>
                              <span className="font-medium text-primary">{uni.tuition}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date limite</span>
                              <span>{new Date(uni.admissionDeadline).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Exigences d'admission</h4>
                            <div className="flex flex-wrap gap-2">
                              {uni.requirements.map((req: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Bourses disponibles</h4>
                            <div className="flex flex-wrap gap-2">
                              {uni.scholarships.map((scholarship: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {scholarship}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Button className="w-full" onClick={() => window.open(uni.website, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Site web
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {userStatus === 'resident' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Home className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Logements en {country.name}</h2>
                    <p className="text-muted-foreground">Trouvez votre nouveau chez-vous</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {housing.map((house) => (
                      <Card key={house.id} className="professional-card">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${house.images[0]})` }}
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-background/90 text-foreground">
                              {house.type}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2">{house.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {house.location}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">{house.description}</p>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prix</span>
                              <span className="font-medium text-primary">{house.price}€/mois</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Surface</span>
                              <span>{house.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pièces</span>
                              <span>{house.rooms}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Disponible</span>
                              <span>{new Date(house.available).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Équipements</h4>
                            <div className="flex flex-wrap gap-2">
                              {house.amenities.map((amenity: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Button className="w-full" onClick={() => window.open(`mailto:${house.contact}`, '_blank')}>
                            Contacter
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Experiences Tab */}
            <TabsContent value="experiences" className="mt-6">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Expériences partagées</h2>
                  <p className="text-muted-foreground">Découvrez les témoignages d'autres voyageurs</p>
                </div>
                
                {experiences.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {experiences.map((exp) => (
                      <Card key={exp.id} className="professional-card">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div
                              className="w-12 h-12 rounded-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${exp.userAvatar})` }}
                            />
                            <div>
                              <h4 className="font-semibold">{exp.userName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(exp.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            {exp.rating && (
                              <div className="ml-auto flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{exp.rating}/5</span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="font-semibold mb-2">{exp.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {exp.content}
                          </p>
                          
                          {exp.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {exp.tags.slice(0, 3).map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {exp.likes}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {exp.comments}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Aucune expérience partagée</h3>
                    <p className="text-muted-foreground mb-6">
                      Soyez le premier à partager votre expérience dans ce pays !
                    </p>
                    {isAuthenticated && (
                      <Button asChild>
                        <Link href="/community">Partager mon expérience</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="mt-6">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Galerie de {country.name}</h2>
                  <p className="text-muted-foreground">Découvrez la beauté de ce pays en images</p>
                </div>
                
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.map((image) => (
                      <Card key={image.id} className="professional-card overflow-hidden">
                        <div className="relative h-64 overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center transition-transform duration-300 hover:scale-105"
                            style={{ backgroundImage: `url(${image.url})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 text-white">
                            <p className="text-sm font-medium">{image.description}</p>
                            <p className="text-xs opacity-75">Par {image.photographer}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Galerie en cours de chargement</h3>
                    <p className="text-muted-foreground">
                      Les images seront bientôt disponibles
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Accommodations Tab */}
            <TabsContent value="accommodations" className="mt-6">
              <div className="space-y-8">
                {/* Restaurants */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Restaurants recommandés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {countryRestaurants.map((restaurant) => (
                      <Card key={restaurant.id} className="professional-card subtle-hover">
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
                                    favorites[`restaurant-${restaurant.id}`] ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                                  }`}
                                />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {restaurant.location}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
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
                              <span className="font-semibold text-primary">
                                {formatCurrency(convertPrice(restaurant.averagePrice, restaurant.currency as Currency), selectedCurrency)}
                              </span>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Hotels */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Hébergements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countryHotels.map((hotel) => (
                      <Card key={hotel.id} className="professional-card subtle-hover">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${hotel.image})` }}
                          />
                          <button
                            onClick={() => toggleFavorite('hotel', hotel.id)}
                            className="absolute top-3 right-3 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                favorites[`hotel-${hotel.id}`] ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
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
                          <p className="text-sm text-muted-foreground mb-3 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {hotel.location}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            {hotel.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-primary">
                                {formatCurrency(convertPrice(hotel.price, hotel.currency as Currency), selectedCurrency)}
                              </span>
                              <span className="text-sm text-muted-foreground">/nuit</span>
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