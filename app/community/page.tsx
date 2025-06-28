'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Filter, 
  Search, 
  Star,
  MapPin,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  Trash2,
  Sparkles,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import countries from '@/data/countries.json';

interface Post {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  countryId?: number;
  countryName?: string;
  rating?: number;
  createdAt: string;
  approvedAt?: string;
  tags: string[];
  likes: number;
  dislikes: number;
  comments: number;
  views: number;
  userLiked?: boolean;
  userDisliked?: boolean;
}

const initialPosts: Post[] = [
  {
    id: 1,
    userId: 1,
    userName: "Jean Dupont",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    title: "Mon expérience visa Canada - Tout s'est bien passé !",
    content: "Salut tout le monde ! Je voulais partager mon expérience récente avec la demande de visa pour le Canada. Le processus était assez long mais bien organisé. Les documents demandés étaient clairs et le suivi en ligne très pratique. J'ai reçu mon visa en 3 semaines exactement. Quelques conseils : préparez tous vos documents à l'avance, soyez précis dans vos réponses, et n'hésitez pas à contacter l'ambassade si vous avez des questions.",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=300&fit=crop",
    status: "approved",
    countryId: 1,
    countryName: "Canada",
    rating: 4,
    createdAt: "2024-11-15T10:30:00Z",
    approvedAt: "2024-11-15T14:20:00Z",
    tags: ["visa", "canada", "expérience", "conseils"],
    likes: 24,
    dislikes: 2,
    comments: 8,
    views: 156
  },
  {
    id: 2,
    userId: 2,
    userName: "Marie Martin",
    userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    title: "Voyage au Japon - Conseils pratiques et bons plans",
    content: "Le Japon est un pays absolument fascinant ! Après 2 semaines sur place, voici mes conseils pour bien préparer votre voyage : 1) Réservez le JR Pass avant de partir, 2) Apprenez quelques mots de japonais de base, 3) Téléchargez Google Translate avec la fonction caméra, 4) Ayez toujours du cash sur vous, 5) Respectez les règles de politesse locales. Les temples de Kyoto sont à couper le souffle, et la nourriture... un délice à chaque repas !",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
    status: "approved",
    countryId: 3,
    countryName: "Japon",
    rating: 5,
    createdAt: "2024-11-14T08:15:00Z",
    approvedAt: "2024-11-14T16:45:00Z",
    tags: ["japon", "voyage", "conseils", "culture"],
    likes: 42,
    dislikes: 1,
    comments: 15,
    views: 289
  },
  {
    id: 3,
    userId: 3,
    userName: "Pierre Durand",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    title: "Demande de visa USA - Quelques difficultés rencontrées",
    content: "Bonjour la communauté ! Je partage mon expérience avec la demande de visa pour les États-Unis. J'ai soumis ma demande il y a 3 semaines et j'ai eu quelques complications. Ils m'ont demandé des documents supplémentaires que je n'avais pas anticipés. Mon conseil : préparez vraiment TOUS les documents possibles, même ceux qui semblent optionnels. L'entretien à l'ambassade s'est bien passé, maintenant j'attends la réponse finale. Je vous tiens au courant !",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&h=300&fit=crop",
    status: "approved",
    countryId: 4,
    countryName: "États-Unis",
    rating: 3,
    createdAt: "2024-11-20T14:22:00Z",
    approvedAt: "2024-11-20T18:30:00Z",
    tags: ["usa", "visa", "difficultés", "conseils"],
    likes: 18,
    dislikes: 3,
    comments: 12,
    views: 134
  }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    countryId: '',
    rating: 5,
    tags: '',
    image: ''
  });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Charger les posts depuis localStorage
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);
      setPosts(parsedPosts);
      setFilteredPosts(parsedPosts.filter((post: Post) => post.status === 'approved'));
    } else {
      // Sauvegarder les posts initiaux
      localStorage.setItem('communityPosts', JSON.stringify(initialPosts));
      setFilteredPosts(initialPosts);
    }
  }, []);

  useEffect(() => {
    let filtered = posts.filter(post => post.status === 'approved');

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtrer par pays
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(post => post.countryId === parseInt(selectedCountry));
    }

    // Trier
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'comments':
        filtered.sort((a, b) => b.comments - a.comments);
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, selectedCountry, sortBy]);

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const post: Post = {
      id: Date.now(),
      userId: user?.id || 0,
      userName: user?.name || 'Utilisateur',
      userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      title: newPost.title,
      content: newPost.content,
      image: newPost.image || undefined,
      status: 'pending',
      countryId: newPost.countryId ? parseInt(newPost.countryId) : undefined,
      countryName: newPost.countryId ? countries.find(c => c.id === parseInt(newPost.countryId))?.name : undefined,
      rating: newPost.rating,
      createdAt: new Date().toISOString(),
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      likes: 0,
      dislikes: 0,
      comments: 0,
      views: 0
    };

    const updatedPosts = [...posts, post];
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));

    setNewPost({
      title: '',
      content: '',
      countryId: '',
      rating: 5,
      tags: '',
      image: ''
    });
    setIsCreateModalOpen(false);
    toast.success('Votre post a été soumis et est en attente de validation');
  };

  const handleLike = (postId: number) => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour interagir avec les posts');
      return;
    }

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (post.userLiked) {
          return { ...post, likes: post.likes - 1, userLiked: false };
        } else {
          return { 
            ...post, 
            likes: post.likes + 1, 
            dislikes: post.userDisliked ? post.dislikes - 1 : post.dislikes,
            userLiked: true, 
            userDisliked: false 
          };
        }
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleDislike = (postId: number) => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour interagir avec les posts');
      return;
    }

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (post.userDisliked) {
          return { ...post, dislikes: post.dislikes - 1, userDisliked: false };
        } else {
          return { 
            ...post, 
            dislikes: post.dislikes + 1,
            likes: post.userLiked ? post.likes - 1 : post.likes,
            userDisliked: true, 
            userLiked: false 
          };
        }
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
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
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center text-white preserve-3d"
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.5)',
                  '0 0 40px rgba(255, 255, 255, 0.8)',
                  '0 0 20px rgba(255, 255, 255, 0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.span
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 200%' }}
              >
                Communauté DORA
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 max-w-2xl mx-auto text-purple-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Partagez vos expériences, découvrez les conseils d'autres voyageurs et construisons ensemble une communauté d'aventuriers
            </motion.p>
            
            {isAuthenticated && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-2xl">
                      <Plus className="h-5 w-5 mr-2" />
                      <Sparkles className="h-4 w-4 mr-2" />
                      Partager mon expérience
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl glass-effect border-0">
                  <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Partager votre expérience
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Ex: Mon expérience visa Canada"
                        className="glass-effect border-border/50"
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label htmlFor="country">Pays concerné</Label>
                      <Select value={newPost.countryId} onValueChange={(value) => setNewPost({ ...newPost, countryId: value })}>
                        <SelectTrigger className="glass-effect border-border/50">
                          <SelectValue placeholder="Sélectionnez un pays" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect">
                          {countries.map(country => (
                            <SelectItem key={country.id} value={country.id.toString()}>
                              {country.flag} {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label htmlFor="rating">Note de votre expérience</Label>
                      <Select value={newPost.rating.toString()} onValueChange={(value) => setNewPost({ ...newPost, rating: parseInt(value) })}>
                        <SelectTrigger className="glass-effect border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect">
                          <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                          <SelectItem value="4">⭐⭐⭐⭐ Très bien</SelectItem>
                          <SelectItem value="3">⭐⭐⭐ Bien</SelectItem>
                          <SelectItem value="2">⭐⭐ Moyen</SelectItem>
                          <SelectItem value="1">⭐ Décevant</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="content">Votre expérience *</Label>
                      <Textarea
                        id="content"
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Partagez votre expérience en détail..."
                        className="min-h-[120px] glass-effect border-border/50"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                      <Input
                        id="tags"
                        value={newPost.tags}
                        onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                        placeholder="Ex: visa, conseils, expérience"
                        className="glass-effect border-border/50"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label htmlFor="image">URL de l'image (optionnel)</Label>
                      <Input
                        id="image"
                        value={newPost.image}
                        onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                        placeholder="https://..."
                        className="glass-effect border-border/50"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button onClick={handleCreatePost} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Publier mon expérience
                      </Button>
                    </motion.div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Filters Section */}
      <section className="py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <motion.div 
              className="flex items-center space-x-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Users className="h-4 w-4" />
              <span>{filteredPosts.length} expérience{filteredPosts.length > 1 ? 's' : ''} partagée{filteredPosts.length > 1 ? 's' : ''}</span>
            </motion.div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 glass-effect border-border/50"
                />
              </motion.div>

              {/* Country Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-40 glass-effect border-border/50">
                    <SelectValue placeholder="Pays" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Sort Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 glass-effect border-border/50">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="recent">Plus récent</SelectItem>
                    <SelectItem value="popular">Plus populaire</SelectItem>
                    <SelectItem value="rating">Mieux noté</SelectItem>
                    <SelectItem value="comments">Plus commenté</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-6 mb-8 glass-effect"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Rejoignez la communauté !
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Connectez-vous pour partager vos expériences, poser des questions et interagir avec d'autres voyageurs.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/auth">Se connecter</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {filteredPosts.length > 0 ? (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50, rotateY: 20 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -10, 
                      rotateY: 5,
                      scale: 1.02,
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
                    }}
                    className="preserve-3d"
                  >
                    <Card className="h-full glass-effect border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                      {post.image && (
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <motion.div
                            className="w-full h-full bg-cover bg-center transition-transform duration-700"
                            style={{ backgroundImage: `url(${post.image})` }}
                            whileHover={{ scale: 1.1, rotateX: 5 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {post.countryName && (
                            <motion.div 
                              className="absolute top-4 left-4"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <Badge className="bg-white/90 text-gray-900 shadow-lg">
                                <MapPin className="h-3 w-3 mr-1" />
                                {post.countryName}
                              </Badge>
                            </motion.div>
                          )}
                          {post.rating && (
                            <motion.div 
                              className="absolute top-4 right-4"
                              whileHover={{ scale: 1.1, rotate: -5 }}
                            >
                              <Badge className="bg-yellow-500 text-white shadow-lg">
                                <Star className="h-3 w-3 mr-1" />
                                {post.rating}/5
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      )}
                      
                      <CardContent className="p-6 bg-background/80 backdrop-blur-sm">
                        <div className="flex items-start space-x-3 mb-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotateY: 15 }}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.userAvatar} alt={post.userName} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {post.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <div className="flex-1">
                            <motion.h3 
                              className="font-semibold text-lg mb-1"
                              whileHover={{ scale: 1.02 }}
                            >
                              {post.title}
                            </motion.h3>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{post.userName}</span>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.content}
                        </p>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.1 }}
                              >
                                <Badge variant="secondary" className="text-xs glass-effect">
                                  #{tag}
                                </Badge>
                              </motion.div>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <motion.button
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-1 text-sm transition-colors ${
                                post.userLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ThumbsUp className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleDislike(post.id)}
                              className={`flex items-center space-x-1 text-sm transition-colors ${
                                post.userDisliked ? 'text-blue-600' : 'text-muted-foreground hover:text-blue-600'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ThumbsDown className={`h-4 w-4 ${post.userDisliked ? 'fill-current' : ''}`} />
                              <span>{post.dislikes}</span>
                            </motion.button>

                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments}</span>
                            </div>

                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Eye className="h-4 w-4" />
                              <span>{post.views}</span>
                            </div>
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button variant="ghost" size="sm" className="glass-effect">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-posts"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucune expérience trouvée
                </h3>
                <p className="text-muted-foreground mb-6">
                  Soyez le premier à partager votre expérience !
                </p>
                {isAuthenticated && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      <Sparkles className="h-4 w-4 mr-2" />
                      Partager mon expérience
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}