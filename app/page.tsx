'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Users, Star, MapPin, Clock, CreditCard, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import countries from '@/data/countries.json';

const heroImages = [
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop'
];

const testimonials = [
  {
    id: 1,
    name: "Marie Dupont",
    country: "France",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "DORA m'a aidée à obtenir mon visa canadien en toute sérénité. Le processus était clairement expliqué !",
    destination: "Canada"
  },
  {
    id: 2,
    name: "Jean Martin",
    country: "Sénégal",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Interface intuitive et conseils précieux. Mon voyage au Japon s'est parfaitement déroulé !",
    destination: "Japon"
  },
  {
    id: 3,
    name: "Fatou Diallo",
    country: "Mali",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Excellent service ! L'assistant IA m'a guidée pas à pas dans mes démarches.",
    destination: "États-Unis"
  },
  {
    id: 4,
    name: "Pierre Ndong",
    country: "Gabon",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Application indispensable pour les voyageurs. Les recommandations d'hôtels sont parfaites !",
    destination: "Royaume-Uni"
  }
];

const features = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Accompagnement Complet",
    description: "Guide étape par étape pour vos démarches de visa",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop"
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "180+ Destinations",
    description: "Informations détaillées sur tous les pays",
    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Communauté Active",
    description: "Partagez vos expériences avec d'autres voyageurs",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop"
  }
];

const stats = [
  { number: "25,000+", label: "Visas traités", icon: <Shield className="h-6 w-6" /> },
  { number: "180+", label: "Destinations", icon: <Globe className="h-6 w-6" /> },
  { number: "98%", label: "Taux de succès", icon: <Star className="h-6 w-6" /> },
  { number: "24/7", label: "Support IA", icon: <Clock className="h-6 w-6" /> }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatorData, setSimulatorData] = useState({
    country: '',
    cost: 0,
    duration: ''
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/countries?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleCountrySelect = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    if (country) {
      setSimulatorData({
        country: country.name,
        cost: country.averageCost,
        duration: country.processingTime
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D effects */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden perspective-1000">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1, rotateY: 10 }}
              animate={{ 
                opacity: index === currentSlide ? 1 : 0,
                scale: index === currentSlide ? 1 : 1.1,
                rotateY: index === currentSlide ? 0 : 10
              }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
            </motion.div>
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <motion.div
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 glass-effect"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 glass-effect"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {heroImages.map((_, index) => (
            <motion.button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="preserve-3d"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 30px rgba(147, 51, 234, 0.8)',
                  '0 0 20px rgba(59, 130, 246, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Simplifiez vos
              <motion.span 
                className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Démarches de Visa
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              DORA vous accompagne pas à pas dans l'obtention de votre visa avec des conseils personnalisés et un suivi complet.
            </motion.p>

            {/* Search Bar with 3D effect */}
            <motion.form 
              onSubmit={handleSearch} 
              className="max-w-md mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              whileHover={{ scale: 1.02, rotateX: 5 }}
            >
              <div className="relative glass-effect rounded-full p-1">
                <Input
                  type="text"
                  placeholder="Rechercher une destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-transparent border-0 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-white/30"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
              </div>
            </motion.form>

            {/* CTA Buttons with 3D effects */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                className="preserve-3d"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-2xl border-0"
                >
                  <Link href={isAuthenticated ? "/visa-steps" : "/countries"}>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isAuthenticated ? "Continuer ma demande" : "Commencer maintenant"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: -5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
                className="preserve-3d"
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg glass-effect"
                >
                  <Link href="/countries">Explorer les destinations</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with 3D cards */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateY: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 10,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                }}
                className="text-center preserve-3d"
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  whileHover={{ rotateY: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-white shadow-lg">
                    {stat.icon}
                  </div>
                </motion.div>
                <motion.div 
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  animate={{ 
                    textShadow: [
                      '0 0 0px rgba(59, 130, 246, 0)',
                      '0 0 10px rgba(59, 130, 246, 0.5)',
                      '0 0 0px rgba(59, 130, 246, 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with enhanced 3D effects */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Pourquoi choisir DORA ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Une plateforme complète pour tous vos besoins de voyage
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateY: 30 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ 
                  y: -10, 
                  rotateY: 10,
                  scale: 1.02,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                }}
                className="group preserve-3d"
              >
                <Card className="h-full overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <div className="relative h-48 overflow-hidden">
                    <motion.div
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${feature.image})` }}
                      whileHover={{ rotateX: 5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <motion.div 
                      className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-lg backdrop-blur-sm"
                      whileHover={{ 
                        scale: 1.1, 
                        rotateY: 15,
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <div className="text-blue-600">
                        {feature.icon}
                      </div>
                    </motion.div>
                  </div>
                  <CardContent className="p-6">
                    <motion.h3 
                      className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
                      whileHover={{ scale: 1.05 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Cost Simulator with enhanced 3D */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-white/5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Simulateur de Coût de Visa
              </h2>
              <p className="text-xl text-blue-100">
                Estimez rapidement le coût et la durée de votre demande
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ 
                scale: 1.02,
                rotateY: 5,
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)'
              }}
              className="preserve-3d"
            >
              <Card className="p-8 shadow-2xl border-0 glass-effect">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-white">
                      Sélectionnez votre destination
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {countries.slice(0, 6).map((country, index) => (
                        <motion.button
                          key={country.id}
                          onClick={() => handleCountrySelect(country.name)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            simulatorData.country === country.name
                              ? 'border-blue-400 bg-blue-500/20'
                              : 'border-white/20 hover:border-blue-400/50 hover:bg-white/10'
                          }`}
                          whileHover={{ 
                            scale: 1.05, 
                            rotateY: 10,
                            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
                          }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center space-x-2">
                            <motion.span 
                              className="text-2xl"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                            >
                              {country.flag}
                            </motion.span>
                            <span className="font-medium text-white">{country.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.div 
                    className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-xl p-6 text-white"
                    whileHover={{ 
                      scale: 1.02,
                      rotateY: -5,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <h3 className="text-2xl font-semibold mb-6">Estimation</h3>
                    {simulatorData.country ? (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div 
                          className="flex items-center space-x-3"
                          whileHover={{ x: 5 }}
                        >
                          <MapPin className="h-5 w-5 text-blue-200" />
                          <span className="text-lg">{simulatorData.country}</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-3"
                          whileHover={{ x: 5 }}
                        >
                          <CreditCard className="h-5 w-5 text-blue-200" />
                          <motion.span 
                            className="text-2xl font-bold"
                            animate={{ 
                              textShadow: [
                                '0 0 10px rgba(255, 255, 255, 0.5)',
                                '0 0 20px rgba(255, 255, 255, 0.8)',
                                '0 0 10px rgba(255, 255, 255, 0.5)'
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {simulatorData.cost}€
                          </motion.span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center space-x-3"
                          whileHover={{ x: 5 }}
                        >
                          <Clock className="h-5 w-5 text-blue-200" />
                          <span className="text-lg">{simulatorData.duration}</span>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            asChild
                            className="w-full mt-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                          >
                            <Link href={`/countries/${simulatorData.country.toLowerCase()}`}>
                              Commencer ma demande
                            </Link>
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="text-center py-8"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Globe className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                        <p className="text-blue-100">
                          Sélectionnez un pays pour voir l'estimation
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with 3D cards */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Plus de 25,000 voyageurs nous font confiance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 50, rotateY: 30 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10, 
                  rotateY: 10,
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                }}
                className="preserve-3d"
              >
                <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <motion.div 
                      className="flex items-center space-x-3 mb-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="w-12 h-12 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${testimonial.image})` }}
                        whileHover={{ scale: 1.1, rotateY: 15 }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.country}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center space-x-1 mb-3"
                      whileHover={{ scale: 1.1 }}
                    >
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      "{testimonial.text}"
                    </p>
                    
                    <Badge variant="outline" className="text-xs">
                      Visa {testimonial.destination}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with enhanced 3D */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80"
            animate={{
              background: [
                'linear-gradient(45deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.8))',
                'linear-gradient(225deg, rgba(236, 72, 153, 0.8), rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))',
                'linear-gradient(45deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.8))'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8 }}
            className="preserve-3d"
          >
            <motion.h2 
              className="text-4xl font-bold text-white mb-6"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.5)',
                  '0 0 40px rgba(255, 255, 255, 0.8)',
                  '0 0 20px rgba(255, 255, 255, 0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Prêt à partir à l'aventure ?
            </motion.h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de voyageurs qui ont simplifié leurs démarches avec DORA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  boxShadow: '0 20px 40px rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-2xl"
                >
                  <Link href="/countries">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: -5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg glass-effect"
                >
                  <Link href="/community">Rejoindre la communauté</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}