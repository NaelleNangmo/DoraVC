'use client';

import { useState, useEffect } from 'react';
import { Language, getLanguageFromStorage, setLanguageToStorage, useTranslation } from '@/lib/i18n';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = getLanguageFromStorage();
    setLanguage(savedLanguage);
    setMounted(true);
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setLanguageToStorage(newLanguage);
  };

  const { t } = useTranslation(language);

  return {
    language,
    changeLanguage,
    t,
    mounted
  };
};