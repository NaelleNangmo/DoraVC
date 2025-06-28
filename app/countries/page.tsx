'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, Clock, CreditCard, Globe, Star, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/currency';
import { countryService, type Country } from '@/lib/services/countryService';

const continents = ['Tous', 'Europe', 'Amérique du Nord', 'Asie', 'Océanie', 'Afrique', 'Amérique du Sud'];
const sortOptions = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'cost', label: 'Coût croissant' },
  { value: 'popular', label: 'Popularité' },
  { value: 'processing', label: 'Délai le plus court' }
];

function CountriesPageContent() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('Tous');
  const [sortBy, setSortBy] = useState('name');
  const [visaFilter, setVisaFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoading(true);
        const countriesData = await countryService.getAll();
        setCountries(countriesData);
        setFilteredCountries(countriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = countries.filter(country => {
      const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           country.continent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           country.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesContinent = selectedContinent === 'Tous' || country.continent === selectedContinent;
      
      const matchesVisa = visaFilter === 'all' ||
                         (visaFilter === 'required' && country.visaRequired) ||
                         (visaFilter === 'not-required' && !country.visaRequired);

      return matchesSearch && matchesContinent && matchesVisa;
    });

    // Sort countries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return a.averageCost - b.averageCost;
        case 'popular':
          return b.id - a.id; // Mock popularity by ID
        case 'processing':
          return parseInt(a.processingTime) - parseInt(b.processingTime);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredCountries(filtered);
  }, [countries, searchQuery, selectedContinent, sortBy, visaFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Hero Section with enhanced 3D effects */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center text-white preserve-3d"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.5)',
                  '0 0 40px rgba(255, 255, 255, 0.8)',
                  '0 0 20px rgba(255, 255, 255, 0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.span
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 200%' }}
              >
                Explorez le Monde
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 max-w-2xl mx-auto text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Découvrez plus de 180 destinations et simplifiez vos démarches de visa
            </motion.p>
            
            {/* Enhanced Search Bar */}
            <motion.form 
              onSubmit={handleSearch} 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              whileHover={{ scale: 1.02, rotateX: 5 }}
            >
              <div className="relative glass-effect rounded-full p-2 shadow-2xl">
                <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-white/70" />
                <Input
                  type="text"
                  placeholder="Rechercher un pays, continent ou ville..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 pr-6 py-6 text-lg bg-transparent border-0 text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/30 rounded-full"
                />
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="rounded-full bg-white/20 hover:bg-white/30 border-0 h-12 w-12 p-0"
                  >
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Filters Section */}
      <section className="py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <motion.div 
              className="flex items-center space-x-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Globe className="h-4 w-4" />
              <span>{filteredCountries.length} destination{filteredCountries.length > 1 ? 's' : ''} trouvée{filteredCountries.length > 1 ? 's' : ''}</span>
            </motion.div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Continent Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                  <SelectTrigger className="w-40 glass-effect border-border/50">
                    <SelectValue placeholder="Continent" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    {continents.map(continent => (
                      <SelectItem key={continent} value={continent}>
                        {continent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Visa Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <Select value={visaFilter} onValueChange={setVisaFilter}>
                  <SelectTrigger className="w-40 glass-effect border-border/50">
                    <SelectValue placeholder="Visa requis" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="required">Visa requis</SelectItem>
                    <SelectItem value="not-required">Sans visa</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Sort Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 glass-effect border-border/50">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" className="lg:hidden glass-effect border-border/50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtres
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent className="glass-effect">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                    <SheetDescription>
                      Affinez votre recherche de destinations
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Continent</label>
                      <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {continents.map(continent => (
                            <SelectItem key={continent} value={continent}>
                              {continent}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Visa</label>
                      <Select value={visaFilter} onValueChange={setVisaFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="required">Visa requis</SelectItem>
                          <SelectItem value="not-required">Sans visa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Trier par</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Countries Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div 
                    key={index} 
                    className="animate-pulse"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-80 glass-effect">
                      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-lg"></div>
                      <CardContent className="p-6">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-4 w-2/3"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/2"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : filteredCountries.length > 0 ? (
              <motion.div
                key="countries"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredCountries.map((country, index) => (
                  <motion.div
                    key={country.id}
                    initial={{ opacity: 0, y: 50, rotateY: 20 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -10, 
                      rotateY: 5,
                      scale: 1.02,
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                    }}
                    className="group preserve-3d"
                  >
                    <Card className="h-full overflow-hidden glass-effect border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                      <div className="relative h-48 overflow-hidden">
                        <motion.div
                          className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${country.image})` }}
                          whileHover={{ rotateX: 5 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        <motion.div 
                          className="absolute top-4 left-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <Badge 
                            variant={country.visaRequired ? "destructive" : "secondary"}
                            className="bg-white/90 text-gray-900 shadow-lg"
                          >
                            {country.visaRequired ? 'Visa requis' : 'Sans visa'}
                          </Badge>
                        </motion.div>
                        
                        <motion.div 
                          className="absolute top-4 right-4"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <span className="text-4xl drop-shadow-lg">{country.flag}</span>
                        </motion.div>
                        
                        <div className="absolute bottom-4 left-4 text-white">
                          <motion.h3 
                            className="text-xl font-bold mb-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            {country.name}
                          </motion.h3>
                          <p className="text-sm text-gray-200 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {country.continent}
                          </p>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 bg-background/80 backdrop-blur-sm">
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {country.description}
                        </p>
                        
                        <div className="space-y-3 mb-6">
                          <motion.div 
                            className="flex items-center justify-between text-sm"
                            whileHover={{ x: 5 }}
                          >
                            <span className="flex items-center text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2" />
                              Délai de traitement
                            </span>
                            <span className="font-medium">{country.processingTime}</span>
                          </motion.div>
                          
                          {country.visaRequired && (
                            <motion.div 
                              className="flex items-center justify-between text-sm"
                              whileHover={{ x: 5 }}
                            >
                              <span className="flex items-center text-muted-foreground">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Coût approximatif
                              </span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(country.averageCost, 'EUR')}
                              </span>
                            </motion.div>
                          )}

                          <motion.div 
                            className="flex items-center justify-between text-sm"
                            whileHover={{ x: 5 }}
                          >
                            <span className="flex items-center text-muted-foreground">
                              <Star className="h-4 w-4 mr-2" />
                              Saison populaire
                            </span>
                            <span className="font-medium">{country.popularSeason}</span>
                          </motion.div>
                        </div>

                        <div className="flex gap-2">
                          <motion.div
                            className="flex-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              asChild
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Link href={`/countries/${country.code.toLowerCase()}`}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Découvrir
                              </Link>
                            </Button>
                          </motion.div>
                          {isAuthenticated && country.visaRequired && (
                            <motion.div
                              className="flex-1"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                asChild
                                variant="outline"
                                className="w-full glass-effect border-border/50 hover:bg-background/80"
                              >
                                <Link href={`/visa-steps?country=${country.code}`}>
                                  Commencer
                                </Link>
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucune destination trouvée
                </h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos critères de recherche
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedContinent('Tous');
                      setVisaFilter('all');
                      setSortBy('name');
                    }}
                    variant="outline"
                    className="glass-effect"
                  >
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default function CountriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-32 w-32 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    }>
      <CountriesPageContent />
    </Suspense>
  );
}