'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Database, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const status = apiClient.isOnline();
      setIsOnline(status);
      
      // Afficher le statut pendant 3 secondes si hors ligne
      if (!status) {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    };

    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    checkConnection(); // Vérification initiale

    return () => clearInterval(interval);
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-4 z-50"
      >
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className="flex items-center space-x-2 px-3 py-2 shadow-lg"
        >
          {isOnline ? (
            <>
              <Database className="h-4 w-4" />
              <span>Base de données connectée</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>Mode hors ligne - Données locales</span>
            </>
          )}
        </Badge>
      </motion.div>
    </AnimatePresence>
  );
}