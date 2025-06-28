'use client';

import { useState, useEffect } from 'react';
import { Theme, getThemeFromStorage, setThemeToStorage, applyTheme } from '@/lib/theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = getThemeFromStorage();
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeToStorage(newTheme);
    applyTheme(newTheme);
  };

  return {
    theme,
    changeTheme,
    mounted
  };
};