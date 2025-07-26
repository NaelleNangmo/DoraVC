'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Coffee, ShoppingBag, Home, Car, Phone, Star, ExternalLink, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import data from '../../data/integration.json';

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
  country: string;
}

export default function IntegrationPage() {
  const [userLocation, setUserLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const placesPerPage = 9;
  const { user, isAuthenticated } = useAuth();

  const categories = [
    { value: 'all', label: 'All', icon: MapPin },
    { value: 'restaurant', label: 'Restaurants', icon: Coffee },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'housing', label: 'Housing', icon: Home },
    { value: 'transport', label: 'Transport', icon: Car },
    { value: 'services', label: 'Services', icon: Phone },
  ];

  const countries = [
    { value: 'all', label: 'All Countries' },
    { value: 'france', label: 'France' },
    { value: 'usa', label: 'United States' },
    { value: 'japan', label: 'Japan' },
    { value: 'brazil', label: 'Brazil' },
    { value: 'india', label: 'India' },
  ];

  // Debounce function to limit filter calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const filterPlaces = useCallback(() => {
    console.log('Filtering places with:', { userLocation, selectedCategory, selectedCountry });
    let filtered = [...places]; // Use places instead of data to reflect loaded state

    if (userLocation.trim()) {
      filtered = filtered.filter(place =>
        place.address.toLowerCase().includes(userLocation.toLowerCase()) ||
        place.name.toLowerCase().includes(userLocation.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(place => place.type === selectedCategory);
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(place => place.country === selectedCountry);
    }

    console.log('Filtered places count:', filtered.length);
    setFilteredPlaces(filtered);
    setCurrentPage(1);
  }, [userLocation, selectedCategory, selectedCountry, places]);

  const debouncedFilterPlaces = useCallback(debounce(filterPlaces, 300), [filterPlaces]);

  useEffect(() => {
    // Initialize with all data on mount
    console.log('Initializing with data:', data.length);
    setPlaces(data);
    setFilteredPlaces(data);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const savedLocation = localStorage.getItem('userLocation');
    const savedCountry = localStorage.getItem('userCountry') || 'all';
    if (savedLocation) {
      setUserLocation(savedLocation);
      setSelectedCountry(savedCountry);
      loadNearbyPlaces(savedLocation, savedCountry);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    debouncedFilterPlaces();
  }, [userLocation, selectedCategory, selectedCountry, debouncedFilterPlaces]);

  const loadNearbyPlaces = async (location: string, country: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlaces(data);
      filterPlaces(); // Apply filters after loading
      console.log('Places loaded:', data.length);
    } catch (error) {
      console.error('Error loading places:', error);
      toast.error('Error loading nearby places');
      setFilteredPlaces(data); // Fallback to all data on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLocation.trim()) {
      localStorage.setItem('userLocation', userLocation);
      localStorage.setItem('userCountry', selectedCountry);
      loadNearbyPlaces(userLocation, selectedCountry);
      toast.success('Location updated');
    }
  };

  const getCategoryIcon = (type: string) => {
    const category = categories.find(cat => cat.value === type);
    return category ? category.icon : MapPin;
  };

  const totalPages = Math.ceil(filteredPlaces.length / placesPerPage);
  const indexOfLastPlace = currentPage * placesPerPage;
  const indexOfFirstPlace = indexOfLastPlace - placesPerPage;
  const currentPlaces = filteredPlaces.slice(indexOfFirstPlace, indexOfLastPlace);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg">
          <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Login Required
          </h1>
          <p className="text-muted-foreground mb-6">
            You must be logged in to access integration services.
          </p>
          <Button asChild>
            <a href="/">Back to Home</a>
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
              Integration in Your New Country
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover essential services and places of interest near you
            </p>
          </div>
        </div>
      </section>

      {/* Location and Country Input */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <form onSubmit={handleLocationSubmit} className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Enter your address, city, or place name..."
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="w-40">
                <Select
                  value={selectedCountry}
                  onValueChange={(value) => {
                    setSelectedCountry(value);
                    localStorage.setItem('userCountry', value);
                    if (userLocation) loadNearbyPlaces(userLocation, value);
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="h-12 px-6">
                <Navigation className="h-4 w-4 mr-2" />
                Locate
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
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory(category.value);
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
          ) : filteredPlaces.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Places Found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your location, country, or category filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPlaces.map((place) => {
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
                              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`;
                              window.open(mapsUrl, '_blank');
                            }}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Directions
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
              {/* Modern Pagination */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full w-10 h-10 p-0 ${currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-primary hover:text-primary-foreground transition-colors'}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Integration Tips */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Integration Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-primary" />
                    Housing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Visit multiple neighborhoods before choosing</li>
                    <li>• Check public transportation options</li>
                    <li>• Research nearby amenities</li>
                    <li>• Contact local real estate agencies</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-primary" />
                    Essential Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Open a local bank account</li>
                    <li>• Get health insurance</li>
                    <li>• Register with local authorities</li>
                    <li>• Find a general practitioner</li>
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
                    <li>• Explore public transport options</li>
                    <li>• Get a transport card</li>
                    <li>• Check bike-sharing services</li>
                    <li>• Learn about local driving licenses</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Social Life
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Join expat communities</li>
                    <li>• Attend local events</li>
                    <li>• Learn or improve the local language</li>
                    <li>• Explore local culture and traditions</li>
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