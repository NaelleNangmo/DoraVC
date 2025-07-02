'use client';

import Link from 'next/link';
import { Globe, Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-foreground">DORA</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre guide digital pour simplifier les démarches de visa et découvrir le monde avec confiance et sérénité.
            </p>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>pour les voyageurs</span>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Navigation</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'Accueil', href: '/' },
                { name: 'Pays', href: '/countries' },
                { name: 'Communauté', href: '/community' },
                { name: 'À propos', href: '/about' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'Centre d\'aide', href: '/help' },
                { name: 'Contact', href: '/contact' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Mentions légales', href: '/legal' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <div className="space-y-4 text-sm">
              {[
                { icon: Mail, text: 'contact@dora.travel', href: 'mailto:contact@dora.travel' },
                { icon: Phone, text: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
                { icon: MapPin, text: 'Paris, France', href: '#' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 text-muted-foreground">
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.href !== '#' ? (
                    <a href={item.href} className="hover:text-foreground transition-colors">
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t py-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm">
            © 2024 DORA. Tous droits réservés.
          </p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            {[
              { name: 'Politique de confidentialité', href: '/privacy' },
              { name: 'Conditions d\'utilisation', href: '/terms' }
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Scroll to top button */}
          <Button
            onClick={scrollToTop}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}