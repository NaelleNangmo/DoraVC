import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Location {
  lat: number;
  lng: number;
}

interface UserLocation extends Location {
  country_code?: string;
  city?: string;
  address?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Essayer de récupérer depuis le backend
        const backendLocation = await apiClient.getUserLocation();
        if (backendLocation) {
          const loc = {
            lat: backendLocation.latitude,
            lng: backendLocation.longitude
          };
          setLocation(loc);
          setUserLocation({
            ...loc,
            country_code: backendLocation.country_code,
            city: backendLocation.city,
            address: backendLocation.address
          });
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Localisation backend indisponible, utilisation du navigateur');
      }

      // Fallback géolocalisation navigateur
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            setLocation(newLocation);
            setUserLocation(newLocation);

            // Sauvegarder dans le backend si disponible
            try {
              await apiClient.setUserLocation({
                latitude: newLocation.lat,
                longitude: newLocation.lng,
                detected_from: 'browser',
                is_current: true
              });
            } catch (error) {
              // Sauvegarder localement en fallback
              if (typeof window !== 'undefined') {
                localStorage.setItem('userLocation', JSON.stringify(newLocation));
              }
            }

            setIsLoading(false);
          },
          (error) => {
            console.log('Géolocalisation refusée:', error.message);
            setError('Géolocalisation refusée');
            
            // Localisation par défaut (Paris)
            const defaultLocation = { lat: 48.8566, lng: 2.3522 };
            setLocation(defaultLocation);
            setUserLocation({ ...defaultLocation, country_code: 'FR', city: 'Paris' });
            setIsLoading(false);
          }
        );
      } else {
        setError('Géolocalisation non supportée');
        
        // Localisation par défaut
        const defaultLocation = { lat: 48.8566, lng: 2.3522 };
        setLocation(defaultLocation);
        setUserLocation({ ...defaultLocation, country_code: 'FR', city: 'Paris' });
        setIsLoading(false);
      }
    };

    getUserLocation();
  }, []);

  const updateLocation = async (newLocation: Location, additionalData?: Partial<UserLocation>) => {
    setLocation(newLocation);
    const updatedUserLocation = { ...newLocation, ...additionalData };
    setUserLocation(updatedUserLocation);

    try {
      await apiClient.setUserLocation({
        latitude: newLocation.lat,
        longitude: newLocation.lng,
        ...additionalData,
        detected_from: 'manual',
        is_current: true
      });
    } catch (error) {
      // Fallback localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userLocation', JSON.stringify(updatedUserLocation));
      }
    }
  };

  return {
    location,
    userLocation,
    isLoading,
    error,
    updateLocation,
    setLocation: updateLocation
  };
};