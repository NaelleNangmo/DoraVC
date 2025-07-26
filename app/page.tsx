'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Users, Star, MapPin, Clock, CreditCard, Search, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { CountrySelector } from '@/components/visa/CountrySelector';
import countries from '@/data/countries.json';

interface Testimonial {
  id: number;
  name: string;
  country: string;
  image: string;
  rating: number;
  text: string;
  destination: string;
  status: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

interface Stat {
  number: string;
  label: string;
  icon: React.ReactNode;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

interface SimulatorData {
  country: string;
  cost: number;
  duration: string;
  visaRequired: boolean;
  costOfLiving: number;
  flightCost: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Marie Dupont",
    country: "France",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "DORA m'a aidée à obtenir mon visa canadien en toute sérénité. Le processus était clairement expliqué !",
    destination: "Canada",
    status: "Étudiante"
  },
  {
    id: 2,
    name: "Jean Martin",
    country: "Sénégal",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Interface intuitive et conseils précieux. Mon voyage au Japon s'est parfaitement déroulé !",
    destination: "Japon",
    status: "Travailleur"
  },
  {
    id: 3,
    name: "Fatou Diallo",
    country: "Mali",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Excellent service ! L'assistant IA m'a guidée pas à pas dans mes démarches.",
    destination: "États-Unis",
    status: "Résidente"
  }
];

const features: Feature[] = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Accompagnement Personnalisé",
    description: "Guide adapté à votre statut : touriste, étudiant, travailleur ou résident",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop"
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "180+ Destinations",
    description: "Informations détaillées et mises à jour en temps réel",
    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Communauté Active",
    description: "Partagez vos expériences avec d'autres voyageurs",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop"
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Intégration Complète",
    description: "Aide à l'installation dans votre nouveau pays",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
  }
];

const stats: Stat[] = [
  { number: "25,000+", label: "Visas traités", icon: <Shield className="h-6 w-6" /> },
  { number: "180+", label: "Destinations", icon: <Globe className="h-6 w-6" /> },
  { number: "98%", label: "Taux de succès", icon: <Star className="h-6 w-6" /> },
  { number: "24/7", label: "Support IA", icon: <Clock className="h-6 w-6" /> }
];

const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Choisissez votre destination",
    description: "Sélectionnez le pays et définissez votre statut (touriste, étudiant, travailleur, résident)"
  },
  {
    step: "02", 
    title: "Suivez votre parcours personnalisé",
    description: "Étapes adaptées à votre profil avec documents requis et délais"
  },
  {
    step: "03",
    title: "Obtenez votre visa",
    description: "Suivi en temps réel jusqu'à l'obtention de votre visa"
  },
  {
    step: "04",
    title: "Intégrez-vous facilement",
    description: "Aide à l'installation et découverte de votre nouveau pays"
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [simulatorData, setSimulatorData] = useState<SimulatorData>({
    country: '',
    cost: 0,
    duration: '',
    visaRequired: false,
    costOfLiving: 0,
    flightCost: 0,
  });
  const [currency, setCurrency] = useState('EUR');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
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
      const costOfLivingData: Record<string, number> = {
        'FR': 1200, 'SN': 400, 'ML': 350, 'CI': 450, 'BF': 380, 'CA': 1500, 'JP': 1300, 'US': 1800
      };
      const flightCostByContinent: Record<string, number> = {
        'Africa': 500, 'North America': 800, 'Asia': 700, 'Europe': 300
      };
      setSimulatorData({
        country: selectedDestination.name,
        cost: selectedDestination.averageCost || 0,
        duration: selectedDestination.processingTime || 'N/A',
        visaRequired: selectedDestination.visaRequired,
        costOfLiving: costOfLivingData[selectedDestination.code] || 1000,
        flightCost: flightCostByContinent[getContinent(selectedDestination.code)] || 600,
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
    const exemptCountries: Record<string, string[]> = {
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

  const getContinent = (countryCode: string): string => {
    const continentMap: Record<string, string> = {
      'FR': 'Europe', 'SN': 'Africa', 'ML': 'Africa', 'CI': 'Africa', 'BF': 'Africa',
      'CA': 'North America', 'JP': 'Asia', 'US': 'North America'
    };
    return continentMap[countryCode] || 'Unknown';
  };

  const convertCurrency = (amount: number, from: string, to: string): number => {
    const rates: Record<string, number> = { 'EUR': 1, 'USD': 1.1, 'JPY': 150, 'XOF': 655.957 };
    const baseAmount = amount / rates[from];
    return Math.round(baseAmount * rates[to]);
  };

  const visaRequirements = getVisaRequirements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&w=1920&q=80')] bg-cover bg-center text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-5 py-2 bg-gold-500/20 rounded-full text-gold-500 text-sm font-semibold mb-6">
              <Award className="h-5 w-5 mr-2" />
              Plateforme de confiance pour vos voyages
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Simplifiez vos <span className="text-gold-500">démarches de voyage</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              DORA vous guide pas à pas avec des solutions personnalisées pour obtenir votre visa et réussir votre intégration.
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-300" />
                <Input
                  type="text"
                  placeholder="Rechercher une destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full text-lg bg-white/70 text-black rounded-lg shadow-md focus:border-gold-500 focus:ring-gold-500"
                />
              </div>
            </form>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-gold-500 text-white hover:bg-gold-600"
              >
                <Link href={isAuthenticated ? "/visa-steps" : "/countries"}>
                  {isAuthenticated ? "Continuer ma demande" : "Commencer maintenant"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 border-gray-200  hover:bg-gray-800/20"
              >
                <Link href="/countries"  className=" border-white text-black">Explorer les destinations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Un processus simple et personnalisé en 4 étapes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                    {step.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-1 bg-gray-200 -translate-x-8" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir DORA ?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète pour tous vos besoins de voyage et d'immigration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${feature.image})` }}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 bg-white/80 rounded-full">{feature.icon}</div>
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Simulator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simulateur de Vie à l'Étranger</h2>
              <p className="text-lg text-gray-600">
                Obtenez une estimation détaillée de votre vie à l'étranger
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Sélectionnez vos options</h3>
                <CountrySelector
                  selectedOrigin={selectedOrigin}
                  selectedDestination={selectedDestination}
                  onOriginChange={setSelectedOrigin}
                  onDestinationChange={setSelectedDestination}
                />
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-base focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="XOF">FCFA (XOF)</option>
                  </select>
                </div>
              </Card>
              <Card className="p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Estimation</h3>
                {selectedOrigin && selectedDestination ? (
                  <div className="space-y-4 text-base">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-900 font-medium">
                        {selectedOrigin.name} → {selectedDestination.name}
                      </span>
                    </div>
                    {visaRequirements && (
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span className="text-gray-900 font-medium">{visaRequirements.message}</span>
                      </div>
                    )}
                    {simulatorData.visaRequired && (
                      <>
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <span className="text-lg font-bold text-gray-900">
                            {convertCurrency(simulatorData.cost, 'EUR', currency)} {currency}
                          </span>
                          <span className="text-sm text-gray-600">(Frais de visa)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="text-gray-900 font-medium">{simulatorData.duration}</span>
                          <span className="text-sm text-gray-600">(Délai de traitement)</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-700" />
                      <span className="text-gray-900 font-medium">
                        Coût de vie (destination): {convertCurrency(simulatorData.costOfLiving, 'EUR', currency)} {currency}/mois
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-700" />
                      <span className="text-gray-900 font-medium">
                        Coût de vie (origine): {convertCurrency(getCostOfLiving(selectedOrigin.code), 'EUR', currency)} {currency}/mois
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-gray-700" />
                      <span className="text-gray-900 font-medium">
                        Différence: {convertCurrency(Math.abs(simulatorData.costOfLiving - getCostOfLiving(selectedOrigin.code)), 'EUR', currency)} {currency} {simulatorData.costOfLiving > getCostOfLiving(selectedOrigin.code) ? 'plus cher' : 'moins cher'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-700" />
                      <span className="text-gray-900 font-medium">
                        Vol (aller simple): {convertCurrency(simulatorData.flightCost, 'EUR', currency)} {currency}
                      </span>
                    </div>
                    <Button
                      asChild
                      className="w-full mt-6 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Link href={`/countries/${selectedDestination.code.toLowerCase()}`}>
                        {simulatorData.visaRequired ? 'Lancer ma demande' : 'Explorer la destination'}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-base">
                      Choisissez vos pays pour voir l'estimation
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-lg text-gray-600">Plus de 25,000 voyageurs nous font confiance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${testimonial.image})` }}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.country}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-3">" {testimonial.text} "</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-sm border-gray-300">
                    Visa {testimonial.destination}
                  </Badge>
                  <Badge variant="secondary" className="text-sm bg-gray-100">
                    {testimonial.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à partir à l'aventure ?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-3xl mx-auto">
            Rejoignez des milliers de voyageurs qui ont simplifié leurs démarches avec DORA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 px-8 bg-gold-500 text-white hover:bg-gold-600"
            >
              <Link href="/countries">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 border-white text-black hover:bg-white/10"
            >
              <Link href="/community" className=" border-white text-black">Rejoindre la communauté</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  function getCostOfLiving(countryCode: string): number {
    const costOfLivingData: Record<string, number> = {
      'FR': 1200, 'SN': 400, 'ML': 350, 'CI': 450, 'BF': 380, 'CA': 1500, 'JP': 1300, 'US': 1800
    };
    return costOfLivingData[countryCode] || 1000;
  }
}