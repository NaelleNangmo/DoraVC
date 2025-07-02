'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, Clock, CreditCard, Globe, Star } from 'lucide-react';
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

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return a.averageCost - b.averageCost;
        case 'popular':
          return b.id - a.id;
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explorez le Monde
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Découvrez plus de 180 destinations et simplifiez vos démarches de visa
            </p>
            
            <form onSubmit={handleSearch} className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un pays, continent ou ville..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{filteredCountries.length} destination{filteredCountries.length > 1 ? 's' : ''} trouvée{filteredCountries.length > 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Continent" />
                </SelectTrigger>
                <SelectContent>
                  {continents.map(continent => (
                    <SelectItem key={continent} value={continent}>
                      {continent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={visaFilter} onValueChange={setVisaFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Visa requis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="required">Visa requis</SelectItem>
                  <SelectItem value="not-required">Sans visa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent>
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

      {/* Countries Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
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
          ) : filteredCountries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCountries.map((country) => (
                <div key={country.id} className="group">
                  <Card className="h-full overflow-hidden professional-card subtle-hover">
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${country.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <Badge 
                          variant={country.visaRequired ? "destructive" : "secondary"}
                          className="bg-background/90 text-foreground"
                        >
                          {country.visaRequired ? 'Visa requis' : 'Sans visa'}
                        </Badge>
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <span className="text-3xl">{country.flag}</span>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold mb-1">{country.name}</h3>
                        <p className="text-sm flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {country.continent}
                        </p>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {country.description}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            Délai de traitement
                          </span>
                          <span className="font-medium">{country.processingTime}</span>
                        </div>
                        
                        {country.visaRequired && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-muted-foreground">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Coût approximatif
                            </span>
                            <span className="font-medium text-primary">
                              {formatCurrency(country.averageCost, 'EUR')}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <Star className="h-4 w-4 mr-2" />
                            Saison populaire
                          </span>
                          <span className="font-medium">{country.popularSeason}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          asChild
                          className="flex-1 btn-primary"
                        >
                          <Link href={`/countries/${country.code.toLowerCase()}`}>
                            Découvrir
                          </Link>
                        </Button>
                        {isAuthenticated && country.visaRequired && (
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1"
                          >
                            <Link href={`/visa-steps?country=${country.code}`}>
                              Commencer
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune destination trouvée
              </h3>
              <p className="text-muted-foreground mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedContinent('Tous');
                  setVisaFilter('all');
                  setSortBy('name');
                }}
                variant="outline"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CountriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-32 w-32 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CountriesPageContent />
    </Suspense>
  );
}