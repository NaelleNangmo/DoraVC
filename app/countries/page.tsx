'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, MapPin, Clock, CreditCard, Globe, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/currency';
import { countryService, type Country } from '@/lib/services/countryService';

// Simuler un fichier JSON local (à adapter avec le chemin réel)
import countriesJson from '@/data/countries.json'; // Assurez-vous que ce fichier existe avec un tableau d'objets Country

const continents = ['Tous', 'Europe', 'Amérique du Nord', 'Asie', 'Océanie', 'Afrique', 'Amérique du Sud'];
const sortOptions = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'cost', label: 'Coût croissant' },
  { value: 'popular', label: 'Popularité' },
  { value: 'processing', label: 'Délai le plus court' }
];
const ITEMS_PER_PAGE = 6;

// Définir un type pour PaginatedResponse si nécessaire (ajustez selon votre service)
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoading(true);
        const response = await countryService.getAll();
        // Extraire uniquement les données du résultat paginé
        const countriesData = 'data' in response ? response.data : response;
        setCountries(countriesData);
        setFilteredCountries(countriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des pays depuis le backend:', error);
        // Fallback sur les données JSON locales
        setCountries(countriesJson);
        setFilteredCountries(countriesJson);
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
    setCurrentPage(1);
  }, [countries, searchQuery, selectedContinent, sortBy, visaFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);
  const paginatedCountries = filteredCountries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <Button
          key={1}
          variant={currentPage === 1 ? 'default' : 'outline'}
          onClick={() => setCurrentPage(1)}
          className="w-10 h-10 rounded-full mx-1 text-sm"
          disabled={currentPage === 1}
        >
          1
        </Button>
      );
      if (startPage > 2) pageNumbers.push(<span key="start-ellipsis" className="mx-1">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          onClick={() => setCurrentPage(i)}
          className="w-10 h-10 rounded-full mx-1 text-sm"
          disabled={currentPage === i}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push(<span key="end-ellipsis" className="mx-1">...</span>);
      pageNumbers.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? 'default' : 'outline'}
          onClick={() => setCurrentPage(totalPages)}
          className="w-10 h-10 rounded-full mx-1 text-sm"
          disabled={currentPage === totalPages}
        >
          {totalPages}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full w-10 h-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers}
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-full w-10 h-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Explorez le Monde</h1>
          <p className="text-xl text-blue-100 mb-6">Découvrez plus de 180 destinations et simplifiez vos démarches de visa</p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-blue-300" />
              <Input
                type="text"
                placeholder="Rechercher un pays, continent ou ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full text-lg border-2 border-blue-200 bg-white/80 rounded-lg shadow-md focus:border-blue-300 focus:ring-0"
              />
            </div>
          </form>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="h-5 w-5" />
              <span>{filteredCountries.length} destination{filteredCountries.length !== 1 ? 's' : ''} trouvée{filteredCountries.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger className="w-48 border-gray-300 bg-white rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionner un continent" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {continents.map(continent => (
                    <SelectItem key={continent} value={continent} className="hover:bg-gray-100">
                      {continent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={visaFilter} onValueChange={setVisaFilter}>
                <SelectTrigger className="w-48 border-gray-300 bg-white rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Visa requis" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="required">Visa requis</SelectItem>
                  <SelectItem value="not-required">Sans visa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-gray-300 bg-white rounded-lg shadow-sm focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-white border-l-gray-200">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                    <SheetDescription>Affinez votre recherche de destinations</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Continent</label>
                      <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                        <SelectTrigger className="w-full mt-2 border-gray-300 bg-white rounded-lg shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {continents.map(continent => (
                            <SelectItem key={continent} value={continent}>
                              {continent}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Visa</label>
                      <Select value={visaFilter} onValueChange={setVisaFilter}>
                        <SelectTrigger className="w-full mt-2 border-gray-300 bg-white rounded-lg shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="required">Visa requis</SelectItem>
                          <SelectItem value="not-required">Sans visa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Trier par</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full mt-2 border-gray-300 bg-white rounded-lg shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
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

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card className="h-96 border-gray-200 rounded-lg shadow-md">
                    <div className="h-56 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : paginatedCountries.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCountries.map((country) => (
                  <Card key={country.id} className="border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-56 overflow-hidden rounded-t-lg">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${country.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant={country.visaRequired ? 'destructive' : 'secondary'}
                          className="bg-white/80 text-gray-900"
                        >
                          {country.visaRequired ? 'Visa requis' : 'Sans visa'}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="text-3xl">{country.flag}</span>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-semibold">{country.name}</h3>
                        <p className="text-sm flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {country.continent}
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{country.description}</p>
                      <div className="space-y-3 mb-6 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            Délai
                          </span>
                          <span className="font-medium">{country.processingTime}</span>
                        </div>
                        {country.visaRequired && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center text-gray-500">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Coût
                            </span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(country.averageCost, 'EUR')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-gray-500">
                            <Star className="h-4 w-4 mr-2" />
                            Saison
                          </span>
                          <span className="font-medium">{country.popularSeason}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          asChild
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                        >
                          <Link href={`/countries/${country.code.toLowerCase()}`}>
                            Découvrir
                          </Link>
                        </Button>
                        {isAuthenticated && country.visaRequired && (
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            <Link href={`/visa-steps?country=${country.code}`}>
                              Commencer
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-10">
                {renderPagination()}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Globe className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Aucune destination trouvée</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedContinent('Tous');
                  setVisaFilter('all');
                  setSortBy('name');
                }}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-32 w-32 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CountriesPageContent />
    </Suspense>
  );
}