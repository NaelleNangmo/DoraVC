'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, CreditCard, Users, Star, Heart, ExternalLink, Sparkles, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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

export default function CountryPage({ params }: CountryPageProps) {
  const [country, setCountry] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const [favorites, setFavorites] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const foundCountry = countries.find(c => c.code.toLowerCase() === params.code.toLowerCase());
    setCountry(foundCountry);
    setIsLoading(false);
  }, [params.code]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-32 w-32 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pays non trouvé</h1>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${country.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-white preserve-3d"
          >
            <motion.div
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                variant="ghost"
                className="text-white hover:bg-white/20 mb-6 p-0 glass-effect"
              >
                <Link href="/countries" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux destinations
                </Link>
              </Button>
            </motion.div>
            
            <div className="flex items-center space-x-6 mb-6">
              <motion.span 
                className="text-8xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                {country.flag}
              </motion.span>
              <div>
                <motion.h1 
                  className="text-6xl font-bold mb-4"
                  animate={{ 
                    textShadow: [
                      '0 0 20px rgba(255, 255, 255, 0.5)',
                      '0 0 40px rgba(255, 255, 255, 0.8)',
                      '0 0 20px rgba(255, 255, 255, 0.5)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {country.name}
                </motion.h1>
                <motion.p 
                  className="text-2xl text-gray-200 flex items-center mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <MapPin className="h-6 w-6 mr-3" />
                  {country.continent} • {country.capital}
                </motion.p>
                <motion.p 
                  className="text-lg text-gray-300 max-w-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {country.description}
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotateY: 10 }}
              >
                <Badge 
                  variant={country.visaRequired ? "destructive" : "secondary"} 
                  className="text-lg px-4 py-2 glass-effect"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {country.visaRequired ? 'Visa requis' : 'Sans visa'}
                </Badge>
              </motion.div>
              <span className="text-xl">{country.language} • {country.currency}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated && country.visaRequired && (
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-2xl"
                  >
                    <Link href={`/visa-steps?country=${country.code}`}>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Commencer ma demande de visa
                    </Link>
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05, rotateY: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg glass-effect"
                  onClick={() => setActiveTab('accommodations')}
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Explorer les hébergements
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Currency Selector */}
      <section className="py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <motion.h2 
              className="text-2xl font-semibold text-gray-900 dark:text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Informations détaillées
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
                <SelectTrigger className="w-40 glass-effect border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect">
                  <SelectItem value="EUR">EUR €</SelectItem>
                  <SelectItem value="USD">USD $</SelectItem>
                  <SelectItem value="XAF">XAF FCFA</SelectItem>
                  <SelectItem value="CAD">CAD $</SelectItem>
                  <SelectItem value="GBP">GBP £</SelectItem>
                  <SelectItem value="JPY">JPY ¥</SelectItem>
                  <SelectItem value="AUD">AUD $</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 glass-effect border-0 shadow-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
                  <Globe className="h-4 w-4 mr-2" />
                  Aperçu
                </TabsTrigger>
                <TabsTrigger value="visa" className="data-[state=active]:bg-white/20">
                  <Shield className="h-4 w-4 mr-2" />
                  Visa
                </TabsTrigger>
                <TabsTrigger value="accommodations" className="data-[state=active]:bg-white/20">
                  <MapPin className="h-4 w-4 mr-2" />
                  Hébergements
                </TabsTrigger>
                <TabsTrigger value="experiences" className="data-[state=active]:bg-white/20">
                  <Star className="h-4 w-4 mr-2" />
                  Expériences
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="glass-effect border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          À propos de {country.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-64 mb-6">
                          <p className="text-foreground leading-relaxed">
                            {country.description}
                          </p>
                        </ScrollArea>
                        
                        <div className="grid grid-cols-2 gap-6">
                          {[
                            { icon: MapPin, label: 'Capitale', value: country.capital },
                            { icon: Users, label: 'Langue', value: country.language },
                            { icon: CreditCard, label: 'Monnaie', value: country.currency },
                            { icon: Star, label: 'Saison', value: country.popularSeason }
                          ].map((item, index) => (
                            <motion.div 
                              key={index}
                              className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg glass-effect"
                              whileHover={{ scale: 1.02, x: 5 }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                <p className="font-medium">{item.value}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Card className="glass-effect border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle>Informations pratiques</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <motion.div 
                          className={`p-4 rounded-lg ${
                            country.visaRequired 
                              ? 'bg-red-50 dark:bg-red-900/20' 
                              : 'bg-green-50 dark:bg-green-900/20'
                          }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <h4 className={`font-semibold mb-2 ${
                            country.visaRequired 
                              ? 'text-red-900 dark:text-red-100' 
                              : 'text-green-900 dark:text-green-100'
                          }`}>
                            {country.visaRequired ? 'Visa requis' : 'Aucun visa requis'}
                          </h4>
                          <p className={`text-sm ${
                            country.visaRequired 
                              ? 'text-red-700 dark:text-red-300' 
                              : 'text-green-700 dark:text-green-300'
                          }`}>
                            {country.visaRequired 
                              ? `Délai: ${country.processingTime} • Coût: ${formatCurrency(convertPrice(country.averageCost, 'EUR'), selectedCurrency)}`
                              : 'Vous pouvez voyager librement pour les séjours touristiques de courte durée'
                            }
                          </p>
                        </motion.div>

                        {isAuthenticated && country.visaRequired && (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                              <Link href={`/visa-steps?country=${country.code}`}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Commencer ma demande de visa
                              </Link>
                            </Button>
                          </motion.div>
                        )}

                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-4">Aperçu rapide</h4>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                              { value: countryHotels.length, label: 'Hôtels', color: 'blue' },
                              { value: countryRestaurants.length, label: 'Restaurants', color: 'green' },
                              { value: countrySites.length, label: 'Sites', color: 'purple' }
                            ].map((stat, index) => (
                              <motion.div 
                                key={index}
                                className="p-3 bg-background/50 rounded-lg glass-effect"
                                whileHover={{ scale: 1.05, y: -2 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                              >
                                <div className={`text-2xl font-bold text-${stat.color}-600`}>
                                  {stat.value}
                                </div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            {/* Visa Tab */}
            <TabsContent value="visa" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="glass-effect border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Exigences de visa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {country.visaRequired ? (
                        <div className="space-y-6">
                          <motion.div 
                            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg glass-effect"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Visa requis</h4>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              Un visa est nécessaire pour entrer en {country.name}
                            </p>
                          </motion.div>

                          <div className="space-y-4">
                            {[
                              { label: 'Délai de traitement', value: country.processingTime },
                              { label: 'Coût approximatif', value: formatCurrency(convertPrice(country.averageCost, 'EUR'), selectedCurrency) }
                            ].map((item, index) => (
                              <motion.div 
                                key={index}
                                className="flex justify-between items-center p-3 bg-background/50 rounded-lg glass-effect"
                                whileHover={{ x: 5 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <span className="text-muted-foreground">{item.label}</span>
                                <Badge variant="outline" className="font-medium">{item.value}</Badge>
                              </motion.div>
                            ))}
                          </div>

                          <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-4">Documents requis</h4>
                            <ScrollArea className="max-h-48">
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {[
                                  'Passeport valide (minimum 6 mois)',
                                  'Photo d\'identité récente',
                                  'Formulaire de demande complété',
                                  'Justificatifs financiers',
                                  'Réservation d\'hôtel',
                                  'Billet d\'avion aller-retour',
                                  'Assurance voyage'
                                ].map((doc, index) => (
                                  <motion.li 
                                    key={index}
                                    className="flex items-center space-x-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                    <span>{doc}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </div>

                          {isAuthenticated && (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button asChild className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <Link href={`/visa-steps?country=${country.code}`}>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Commencer ma demande
                                </Link>
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <motion.div 
                          className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg glass-effect text-center"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-8 w-8 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Aucun visa requis</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Vous pouvez voyager en {country.name} sans visa pour les séjours touristiques de courte durée.
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="glass-effect border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>Processus de demande</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {country.visaRequired ? (
                        <div className="space-y-6">
                          {[
                            { step: 1, title: 'Préparation', desc: 'Rassemblez tous les documents requis' },
                            { step: 2, title: 'Rendez-vous', desc: 'Prenez rendez-vous au consulat' },
                            { step: 3, title: 'Soumission', desc: 'Soumettez votre dossier complet' },
                            { step: 4, title: 'Suivi', desc: 'Suivez l\'évolution de votre demande' }
                          ].map((item, index) => (
                            <motion.div 
                              key={index}
                              className="flex items-start space-x-4"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ x: 5 }}
                            >
                              <motion.div 
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                {item.step}
                              </motion.div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <motion.div 
                            className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              scale: { duration: 2, repeat: Infinity },
                              rotate: { duration: 3, repeat: Infinity }
                            }}
                          >
                            <Users className="h-10 w-10 text-green-600" />
                          </motion.div>
                          <h4 className="font-semibold mb-3 text-xl">Voyage simplifié</h4>
                          <p className="text-muted-foreground">
                            Aucune démarche de visa nécessaire. Vous pouvez voyager librement !
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Accommodations Tab */}
            <TabsContent value="accommodations" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {countryHotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 30, rotateY: 20 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -10, 
                      rotateY: 5,
                      scale: 1.02,
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                    }}
                    className="preserve-3d"
                  >
                    <Card className="h-full overflow-hidden glass-effect border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                      <div className="relative h-48 overflow-hidden">
                        <motion.div
                          className="w-full h-full bg-cover bg-center transition-transform duration-700"
                          style={{ backgroundImage: `url(${hotel.image})` }}
                          whileHover={{ scale: 1.1, rotateX: 5 }}
                        />
                        <motion.button
                          onClick={() => toggleFavorite('hotel', hotel.id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites[`hotel-${hotel.id}`] ? 'fill-red-500 text-red-500' : 'text-gray-600'
                            }`}
                          />
                        </motion.button>
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: hotel.rating }).map((_, i) => (
                              <motion.div
                                key={i}
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 3 }}
                              >
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6 bg-background/80 backdrop-blur-sm">
                        <motion.h3 
                          className="font-semibold text-lg mb-2"
                          whileHover={{ scale: 1.02 }}
                        >
                          {hotel.name}
                        </motion.h3>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {hotel.location}
                        </p>
                        <ScrollArea className="max-h-20 mb-4">
                          <p className="text-sm text-foreground">
                            {hotel.description}
                          </p>
                        </ScrollArea>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <motion.span 
                              className="text-2xl font-bold text-blue-600"
                              animate={{ 
                                textShadow: [
                                  '0 0 0px rgba(59, 130, 246, 0)',
                                  '0 0 10px rgba(59, 130, 246, 0.5)',
                                  '0 0 0px rgba(59, 130, 246, 0)'
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            >
                              {formatCurrency(convertPrice(hotel.price, hotel.currency as Currency), selectedCurrency)}
                            </motion.span>
                            <span className="text-sm text-muted-foreground">/nuit</span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button size="sm" variant="outline" className="glass-effect">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                          </motion.div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hotel.amenities.slice(0, 3).map((amenity, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Badge variant="secondary" className="text-xs glass-effect">
                                {amenity}
                              </Badge>
                            </motion.div>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hotel.amenities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Experiences Tab */}
            <TabsContent value="experiences" className="mt-8">
              <div className="space-y-12">
                {/* Restaurants */}
                <div>
                  <motion.h3 
                    className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Restaurants recommandés
                  </motion.h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {countryRestaurants.map((restaurant, index) => (
                      <motion.div
                        key={restaurant.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <Card className="hover:shadow-xl transition-all duration-300 glass-effect border-0 shadow-lg">
                          <div className="flex">
                            <div className="relative w-32 h-32 overflow-hidden">
                              <motion.div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${restaurant.image})` }}
                                whileHover={{ scale: 1.1 }}
                              />
                            </div>
                            <CardContent className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-2">
                                <motion.h4 
                                  className="font-semibold text-lg"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  {restaurant.name}
                                </motion.h4>
                                <motion.button
                                  onClick={() => toggleFavorite('restaurant', restaurant.id)}
                                  className="p-1"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      favorites[`restaurant-${restaurant.id}`] ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                    }`}
                                  />
                                </motion.button>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {restaurant.location}
                              </p>
                              <ScrollArea className="max-h-16 mb-3">
                                <p className="text-sm text-foreground">
                                  {restaurant.description}
                                </p>
                              </ScrollArea>
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
                                <motion.span 
                                  className="font-semibold text-green-600"
                                  animate={{ 
                                    textShadow: [
                                      '0 0 0px rgba(34, 197, 94, 0)',
                                      '0 0 10px rgba(34, 197, 94, 0.5)',
                                      '0 0 0px rgba(34, 197, 94, 0)'
                                    ]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                                >
                                  {formatCurrency(convertPrice(restaurant.averagePrice, restaurant.currency as Currency), selectedCurrency)}
                                </motion.span>
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
                  <motion.h3 
                    className="text-3xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Sites touristiques
                  </motion.h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {countrySites.map((site, index) => (
                      <motion.div
                        key={site.id}
                        initial={{ opacity: 0, y: 30, rotateY: 20 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ 
                          y: -10, 
                          rotateY: 5,
                          scale: 1.02,
                          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                        }}
                        className="preserve-3d"
                      >
                        <Card className="h-full overflow-hidden glass-effect border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                          <div className="relative h-48 overflow-hidden">
                            <motion.div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${site.image})` }}
                              whileHover={{ scale: 1.1, rotateX: 5 }}
                            />
                            <motion.button
                              onClick={() => toggleFavorite('site', site.id)}
                              className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow-lg"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites[`site-${site.id}`] ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                              />
                            </motion.button>
                            <div className="absolute bottom-3 left-3">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                              >
                                <Badge className="bg-white/90 text-gray-900 shadow-lg">
                                  {site.category}
                                </Badge>
                              </motion.div>
                            </div>
                          </div>
                          <CardContent className="p-6 bg-background/80 backdrop-blur-sm">
                            <motion.h4 
                              className="font-semibold text-lg mb-2"
                              whileHover={{ scale: 1.02 }}
                            >
                              {site.name}
                            </motion.h4>
                            <p className="text-sm text-muted-foreground mb-2 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {site.location}
                            </p>
                            <ScrollArea className="max-h-20 mb-4">
                              <p className="text-sm text-foreground">
                                {site.description}
                              </p>
                            </ScrollArea>
                            <div className="space-y-2 text-sm">
                              {[
                                { label: 'Durée recommandée', value: site.visitDuration },
                                { label: 'Meilleure période', value: site.bestTime },
                                ...(site.entryFee > 0 ? [{ 
                                  label: 'Entrée', 
                                  value: formatCurrency(convertPrice(site.entryFee, site.currency as Currency), selectedCurrency),
                                  isPrice: true 
                                }] : [])
                              ].map((info, i) => (
                                <motion.div 
                                  key={i}
                                  className="flex justify-between items-center"
                                  whileHover={{ x: 5 }}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                >
                                  <span className="text-muted-foreground">{info.label}</span>
                                  <span className={`font-medium ${info.isPrice ? 'text-green-600' : ''}`}>
                                    {info.value}
                                  </span>
                                </motion.div>
                              ))}
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