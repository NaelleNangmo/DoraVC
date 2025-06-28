'use client';

import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';

export function LanguageToggle() {
  const { language, changeLanguage, mounted } = useLanguage();

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
        <motion.div
          whileHover={{ scale: 1.05, rotateY: 10 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" size="sm" className="w-9 h-9 p-0 glass-effect">
            <motion.span
              className="text-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {getFlag()}
            </motion.span>
            <span className="sr-only">Changer la langue</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-effect">
        <DropdownMenuItem onClick={() => changeLanguage('fr')}>
          <motion.div
            className="flex items-center"
            whileHover={{ x: 5 }}
          >
            <span className="mr-2 text-lg">🇫🇷</span>
            <span>Français</span>
          </motion.div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <motion.div
            className="flex items-center"
            whileHover={{ x: 5 }}
          >
            <span className="mr-2 text-lg">🇺🇸</span>
            <span>English</span>
          </motion.div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('es')}>
          <motion.div
            className="flex items-center"
            whileHover={{ x: 5 }}
          >
            <span className="mr-2 text-lg">🇪🇸</span>
            <span>Español</span>
          </motion.div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}