'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import countries from '@/data/countries.json';

interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  continent: string;
  visaRequired: boolean;
}

interface CountrySelectorProps {
  selectedOrigin: Country | null;
  selectedDestination: Country | null;
  onOriginChange: (country: Country | null) => void;
  onDestinationChange: (country: Country | null) => void;
  className?: string;
}

export function CountrySelector({
  selectedOrigin,
  selectedDestination,
  onOriginChange,
  onDestinationChange,
  className = ''
}: CountrySelectorProps) {
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const filteredOriginCountries = countries.filter(country =>
    country.name.toLowerCase().includes(originSearch.toLowerCase()) ||
    country.continent.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDestinationCountries = countries.filter(country =>
    country.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    country.continent.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  const handleOriginSelect = (country: Country) => {
    onOriginChange(country);
    setOriginSearch(country.name);
    setShowOriginDropdown(false);
  };

  const handleDestinationSelect = (country: Country) => {
    onDestinationChange(country);
    setDestinationSearch(country.name);
    setShowDestinationDropdown(false);
  };

  useEffect(() => {
    if (selectedOrigin) {
      setOriginSearch(selectedOrigin.name);
    }
  }, [selectedOrigin]);

  useEffect(() => {
    if (selectedDestination) {
      setDestinationSearch(selectedDestination.name);
    }
  }, [selectedDestination]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pays d'origine */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Label htmlFor="origin-country" className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
          Pays d'origine
        </Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="origin-country"
              placeholder="Rechercher votre pays d'origine..."
              value={originSearch}
              onChange={(e) => {
                setOriginSearch(e.target.value);
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              className="pl-10 glass-effect border-border/50"
            />
            {selectedOrigin && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <span className="text-lg">{selectedOrigin.flag}</span>
              </div>
            )}
          </div>

          {showOriginDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto glass-effect"
            >
              {filteredOriginCountries.map((country, index) => (
                <motion.button
                  key={country.id}
                  onClick={() => handleOriginSelect(country)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{country.name}</div>
                    <div className="text-sm text-muted-foreground">{country.continent}</div>
                  </div>
                </motion.button>
              ))}
              {filteredOriginCountries.length === 0 && (
                <div className="px-4 py-3 text-center text-muted-foreground">
                  Aucun pays trouvé
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Pays de destination */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="destination-country" className="flex items-center">
          <Globe className="h-4 w-4 mr-2 text-purple-600" />
          Pays de destination
        </Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="destination-country"
              placeholder="Rechercher votre destination..."
              value={destinationSearch}
              onChange={(e) => {
                setDestinationSearch(e.target.value);
                setShowDestinationDropdown(true);
              }}
              onFocus={() => setShowDestinationDropdown(true)}
              className="pl-10 glass-effect border-border/50"
            />
            {selectedDestination && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <span className="text-lg">{selectedDestination.flag}</span>
              </div>
            )}
          </div>

          {showDestinationDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto glass-effect"
            >
              {filteredDestinationCountries.map((country, index) => (
                <motion.button
                  key={country.id}
                  onClick={() => handleDestinationSelect(country)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{country.name}</div>
                    <div className="text-sm text-muted-foreground">{country.continent}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={country.visaRequired ? "destructive" : "secondary"} className="text-xs">
                      {country.visaRequired ? 'Visa requis' : 'Sans visa'}
                    </Badge>
                  </div>
                </motion.button>
              ))}
              {filteredDestinationCountries.length === 0 && (
                <div className="px-4 py-3 text-center text-muted-foreground">
                  Aucun pays trouvé
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Résumé de la sélection */}
      {selectedOrigin && selectedDestination && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="text-2xl">{selectedOrigin.flag}</div>
                    <div className="text-xs font-medium">{selectedOrigin.name}</div>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="text-center">
                    <div className="text-2xl">{selectedDestination.flag}</div>
                    <div className="text-xs font-medium">{selectedDestination.name}</div>
                  </div>
                </div>
                <Badge 
                  variant={selectedDestination.visaRequired ? "destructive" : "secondary"}
                  className="ml-4"
                >
                  {selectedDestination.visaRequired ? 'Visa requis' : 'Sans visa'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}