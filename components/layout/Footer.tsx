'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe, Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"
                whileHover={{ 
                  rotateY: 360,
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)'
                }}
                transition={{ duration: 0.8 }}
              >
                <Globe className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DORA
              </span>
            </motion.div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Votre guide digital pour simplifier les démarches de visa et découvrir le monde avec confiance et sérénité.
            </p>
            <motion.div 
              className="flex items-center space-x-1 text-sm text-gray-400"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span>Fait avec</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="h-4 w-4 text-red-400 fill-current" />
              </motion.div>
              <span>pour les voyageurs</span>
            </motion.div>
          </motion.div>

          {/* Liens rapides */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-semibold mb-4 text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'Accueil', href: '/' },
                { name: 'Pays', href: '/countries' },
                { name: 'Communauté', href: '/community' },
                { name: 'À propos', href: '/about' }
              ].map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.05 }}
                >
                  <Link 
                    href={item.href} 
                    className="text-gray-300 hover:text-white transition-all duration-300 hover:text-shadow-lg relative group"
                  >
                    {item.name}
                    <motion.span 
                      className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-semibold mb-4 text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'Centre d\'aide', href: '/help' },
                { name: 'Contact', href: '/contact' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Mentions légales', href: '/legal' }
              ].map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.05 }}
                >
                  <Link 
                    href={item.href} 
                    className="text-gray-300 hover:text-white transition-all duration-300 relative group"
                  >
                    {item.name}
                    <motion.span 
                      className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="font-semibold mb-4 text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Contact
            </h3>
            <div className="space-y-4 text-sm">
              {[
                { icon: Mail, text: 'contact@dora.travel', href: 'mailto:contact@dora.travel' },
                { icon: Phone, text: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
                { icon: MapPin, text: 'Paris, France', href: '#' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.05, color: '#ffffff' }}
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="h-4 w-4 text-blue-400" />
                  </motion.div>
                  {item.href !== '#' ? (
                    <a href={item.href} className="hover:text-white transition-colors">
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div 
          className="border-t border-gray-700/50 py-6 flex flex-col md:flex-row items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.p 
            className="text-gray-400 text-sm"
            whileHover={{ scale: 1.05 }}
          >
            © 2024 DORA. Tous droits réservés.
          </motion.p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            {[
              { name: 'Politique de confidentialité', href: '/privacy' },
              { name: 'Conditions d\'utilisation', href: '/terms' }
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link 
                  href={item.href} 
                  className="text-gray-400 hover:text-white text-sm transition-colors relative group"
                >
                  {item.name}
                  <motion.span 
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Scroll to top button */}
          <motion.div
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}