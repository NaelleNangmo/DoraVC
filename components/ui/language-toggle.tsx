'use client';

import { useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Language = 'fr' | 'en' | 'es';

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLanguage = (localStorage.getItem('language') as Language) || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
        <Languages className="h-4 w-4" />
      </Button>
    );
  }

  const getFlag = () => {
    switch (language) {
      case 'fr':
        return '🇫🇷';
      case 'en':
        return '🇺🇸';
      case 'es':
        return '🇪🇸';
      default:
        return '🇫🇷';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
          <span className="text-lg">{getFlag()}</span>
          <span className="sr-only">Changer la langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('fr')}>
          <span className="mr-2 text-lg">🇫🇷</span>
          <span>Français</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <span className="mr-2 text-lg">🇺🇸</span>
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('es')}>
          <span className="mr-2 text-lg">🇪🇸</span>
          <span>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}