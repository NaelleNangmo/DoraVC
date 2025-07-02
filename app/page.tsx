'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Users, Star, MapPin, Clock, CreditCard, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { CountrySelector } from '@/components/visa/CountrySelector';
import countries from '@/data/countries.json';

const testimonials = [
  {
    id: 1,
    name: "Marie Dupont",
    country: "France",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "DORA m'a aidée à obtenir mon visa canadien en toute sérénité. Le processus était clairement expliqué !",
    destination: "Canada"
  },
  {
    id: 2,
    name: "Jean Martin",
    country: "Sénégal",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Interface intuitive et conseils précieux. Mon voyage au Japon s'est parfaitement déroulé !",
    destination: "Japon"
  },
  {
    id: 3,
    name: "Fatou Diallo",
    country: "Mali",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Excellent service ! L'assistant IA m'a guidée pas à pas dans mes démarches.",
    destination: "États-Unis"
  }
];

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Accompagnement Complet",
    description: "Guide étape par étape pour vos démarches de visa",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "180+ Destinations",
    description: "Informations détaillées sur tous les pays",
    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Communauté Active",
    description: "Partagez vos expériences avec d'autres voyageurs",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop"
  }
];

const stats = [
  { number: "25,000+", label: "Visas traités", icon: <Shield className="h-5 w-5" /> },
  { number: "180+", label: "Destinations", icon: <Globe className="h-5 w-5" /> },
  { number: "98%", label: "Taux de succès", icon: <Star className="h-5 w-5" /> },
  { number: "24/7", label: "Support IA", icon: <Clock className="h-5 w-5" /> }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [simulatorData, setSimulatorData] = useState({
    country: '',
    cost: 0,
    duration: '',
    visaRequired: false
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Détecter automatiquement le pays d'origine
    try {
      const userLocale = navigator.language || 'fr-FR';
      const countryCode = userLocale.split('-')[1];
      
      if (countryCode) {
        const detectedCountry = countries.find(c => c.code === countryCode);
        if (detectedCountry && !selectedOrigin) {
          setSelectedOrigin(detectedCountry);
        }
      }
    } catch (error) {
      console.log('Impossible de détecter le pays automatiquement');
    }
  }, [selectedOrigin]);

  useEffect(() => {
    if (selectedDestination) {
      setSimulatorData({
        country: selectedDestination.name,
        cost: selectedDestination.averageCost || 0,
        duration: selectedDestination.processingTime || 'N/A',
        visaRequired: selectedDestination.visaRequired
      });
    }
  }, [selectedDestination]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/countries?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getVisaRequirements = () => {
    if (!selectedOrigin || !selectedDestination) return null;
    
    if (selectedOrigin.id === selectedDestination.id) {
      return { required: false, message: "Voyage domestique - aucun visa requis" };
    }
    
    const exemptCountries = {
      'FR': ['SN', 'ML', 'CI', 'BF', 'MA', 'TN'],
      'SN': ['ML', 'CI', 'BF', 'FR'],
      'ML': ['SN', 'CI', 'BF', 'FR'],
      'CI': ['SN', 'ML', 'BF', 'FR'],
      'BF': ['SN', 'ML', 'CI', 'FR']
    };

    const originExemptions = exemptCountries[selectedOrigin.code as keyof typeof exemptCountries] || [];
    const isExempt = originExemptions.includes(selectedDestination.code);

    if (isExempt) {
      return { required: false, message: "Exemption de visa selon les accords bilatéraux" };
    }

    return { 
      required: selectedDestination.visaRequired, 
      message: selectedDestination.visaRequired ? "Visa requis" : "Aucun visa requis"
    };
  };

  const visaRequirements = getVisaRequirements();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-max section-padding">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Simplifiez vos
              <span className="block text-primary">Démarches de Visa</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              DORA vous accompagne pas à pas dans l'obtention de votre visa avec des conseils personnalisés et un suivi complet.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher une destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="btn-primary h-12 px-8"
              >
                <Link href={isAuthenticated ? "/visa-steps" : "/countries"}>
                  {isAuthenticated ? "Continuer ma demande" : "Commencer maintenant"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8"
              >
                <Link href="/countries">Explorer les destinations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pourquoi choisir DORA ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme complète pour tous vos besoins de voyage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="professional-card p-6 subtle-hover">
                <div className="h-48 bg-cover bg-center rounded-lg mb-4"
                     style={{ backgroundImage: `url(${feature.image})` }} />
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary mr-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Simulator */}
      <section className="section-padding bg-muted/30">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Simulateur de Visa Intelligent
              </h2>
              <p className="text-lg text-muted-foreground">
                Sélectionnez vos pays d'origine et de destination pour une estimation personnalisée
              </p>
            </div>

            <div className="professional-card p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-foreground">
                    Sélectionnez vos pays
                  </h3>
                  <CountrySelector
                    selectedOrigin={selectedOrigin}
                    selectedDestination={selectedDestination}
                    onOriginChange={setSelectedOrigin}
                    onDestinationChange={setSelectedDestination}
                  />
                </div>

                <div className="bg-primary/5 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-6 text-foreground">Estimation</h3>
                  {selectedOrigin && selectedDestination ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-foreground">
                          {selectedOrigin.name} → {selectedDestination.name}
                        </span>
                      </div>

                      {visaRequirements && (
                        <div className="flex items-center space-x-3">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="text-foreground">{visaRequirements.message}</span>
                        </div>
                      )}

                      {simulatorData.visaRequired && (
                        <>
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-4 w-4 text-primary" />
                            <span className="text-xl font-bold text-foreground">
                              {simulatorData.cost}€
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-foreground">{simulatorData.duration}</span>
                          </div>
                        </>
                      )}

                      <Button
                        asChild
                        className="w-full mt-6 btn-primary"
                      >
                        <Link href={`/countries/${selectedDestination.code.toLowerCase()}`}>
                          {simulatorData.visaRequired ? 'Commencer ma demande' : 'Découvrir la destination'}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Sélectionnez vos pays d'origine et de destination pour voir l'estimation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-lg text-muted-foreground">
              Plus de 25,000 voyageurs nous font confiance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="professional-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${testimonial.image})` }}
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.country}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground text-sm mb-3">
                  "{testimonial.text}"
                </p>
                
                <Badge variant="outline" className="text-xs">
                  Visa {testimonial.destination}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à partir à l'aventure ?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des milliers de voyageurs qui ont simplifié leurs démarches avec DORA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 px-8"
            >
              <Link href="/countries">
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/community">Rejoindre la communauté</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}