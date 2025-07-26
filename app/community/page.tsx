'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Search, 
  Star,
  MapPin,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Users,
  ChevronLeft,
  ChevronRight
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
import { communityService, type Post } from '@/lib/services/communityService'; // Importer le service
import usersJson from '../../data/users.json'; // Fallback pour les utilisateurs
import postsJson from '../../data/posts.json'; // Fallback pour les posts
import PostDetailModal from '@/components/community/PostDetailModal'; // Ajout de l'importation

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar: string;
  joinedDate: string;
  preferences: {
    language: string;
    currency: string;
  };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const countries = [
    { id: 1, name: 'Canada', flag: '🇨🇦' },
    { id: 3, name: 'Japon', flag: '🇯🇵' },
    { id: 4, name: 'États-Unis', flag: '🇺🇸' },
  ];

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsData = await communityService.getPosts();
        const postsWithUsers = postsData.map((post: Post) => ({
          ...post,
          userName: usersJson.find((u: User) => u.id === post.userId)?.name || 'Anonyme',
          userAvatar: usersJson.find((u: User) => u.id === post.userId)?.avatar || '',
          comments: post.comments || [],
          dislikes: post.dislikes || 0,
          views: post.views || 0
        }));
        setPosts(postsWithUsers);
      } catch (error) {
        console.error('Erreur lors du chargement des posts depuis le backend:', error);
        // Fallback sur les données JSON locales
        const postsWithUsers = postsJson.map((post: Post) => ({
          ...post,
          userName: usersJson.find((u: User) => u.id === post.userId)?.name || 'Anonyme',
          userAvatar: usersJson.find((u: User) => u.id === post.userId)?.avatar || '',
          comments: post.comments || [],
          dislikes: post.dislikes || 0,
          views: post.views || 0
        }));
        setPosts(postsWithUsers);
      }
    };
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(post => post.countryId === parseInt(selectedCountry));
    }

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
        filtered.sort((a, b) => b.comments.length - a.comments.length);
        break;
    }

    return filtered;
  }, [posts, searchQuery, selectedCountry, sortBy]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const country = countries.find(c => c.id === parseInt(newPost.countryId));
      const postData: Post = {
        id: posts.length + 1,
        userId: user?.id || 0,
        userName: user?.name || 'Utilisateur',
        userAvatar: user?.avatar || '',
        title: newPost.title,
        content: newPost.content,
        image: newPost.image.trim() || country?.flag || '',
        countryId: newPost.countryId ? parseInt(newPost.countryId) : undefined,
        rating: newPost.rating,
        createdAt: new Date().toISOString(),
        approvedAt: undefined,
        status: 'pending',
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        likes: 0,
        comments: [],
        dislikes: 0,
        views: 0,
      };

      setPosts(prev => [postData, ...prev]);
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
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
      toast.error('Erreur lors de la création du post');
    }
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

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 bg-blue-50">
        <div className="text-center p-8 dark:bg-gray-800 bg-white rounded-lg shadow-lg dark:text-gray-200 text-blue-900">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 dark:text-gray-400 text-blue-600" />
          <h1 className="text-2xl font-bold mb-2">
            Rejoignez la communauté !
          </h1>
          <p className="mb-6 dark:text-gray-400 text-blue-700">
            Connectez-vous pour partager vos expériences et interagir avec d'autres voyageurs.
          </p>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500">
            <Link href="/auth">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-blue-50 dark:text-gray-200 text-blue-900">
      {/* Hero Section */}
      <section className="py-16 dark:bg-gray-800 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Communauté DORA</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Partagez vos expériences, découvrez les conseils d'autres voyageurs et construisons ensemble une communauté d'aventuriers.
          </p>
          {isAuthenticated && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white dark:text-gray-800 dark:hover:bg-gray-700 text-blue-600 hover:bg-blue-100 shadow-lg">
                  <Plus className="h-5 w-5 mr-2" /> Partager mon expérience
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 bg-white border-blue-200">
                <DialogHeader>
                  <DialogTitle className="text-2xl dark:text-gray-200 text-blue-900">
                    Partager votre expérience
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Ex: Mon expérience visa Canada"
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays concerné</Label>
                    <Select value={newPost.countryId} onValueChange={(value) => setNewPost({ ...newPost, countryId: value })}>
                      <SelectTrigger className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200">
                        <SelectValue placeholder="Sélectionnez un pays" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                        {countries.map(country => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rating">Note de votre expérience</Label>
                    <Select value={newPost.rating.toString()} onValueChange={(value) => setNewPost({ ...newPost, rating: parseInt(value) })}>
                      <SelectTrigger className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Très bien</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Bien</SelectItem>
                        <SelectItem value="2">⭐⭐ Moyen</SelectItem>
                        <SelectItem value="1">⭐ Décevant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Votre expérience *</Label>
                    <Textarea
                      id="content"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Partagez votre expérience en détail..."
                      className="min-h-[120px] border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      placeholder="Ex: visa, conseils, expérience"
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">URL de l'image (optionnel)</Label>
                    <Input
                      id="image"
                      value={newPost.image}
                      onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                      placeholder="https://... (laissez vide pour utiliser l'image du pays)"
                      className="border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200"
                    />
                    <p className="text-xs dark:text-gray-400 text-blue-700 mt-1">
                      Si aucune image n'est fournie, l'image du pays sélectionné sera utilisée automatiquement.
                    </p>
                  </div>
                  <Button onClick={handleCreatePost} className="w-full dark:bg-blue-600 dark:hover:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> Publier mon expérience
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 dark:bg-gray-800 dark:border-gray-700 bg-white/80 border-b border-blue-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm dark:text-gray-300 text-blue-900">
              <Users className="h-4 w-4 dark:text-gray-400 text-blue-600" />
              <span>{filteredPosts.length} expérience{filteredPosts.length > 1 ? 's' : ''} partagée{filteredPosts.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-400 text-blue-600" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200"
                />
              </div>
              <div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-40 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200">
                    <SelectValue placeholder="Pays" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 border-blue-200">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-200">
                    <SelectItem value="recent">Plus récent</SelectItem>
                    <SelectItem value="popular">Plus populaire</SelectItem>
                    <SelectItem value="rating">Mieux noté</SelectItem>
                    <SelectItem value="comments">Plus commenté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {currentPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {currentPosts.map((post, index) => {
                  const country = countries.find(c => c.id === post.countryId);
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.01, boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)' }}
                      className="cursor-pointer"
                    >
                      <Card className="h-full dark:bg-gray-800 dark:border-gray-700 bg-white border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        {post.image && (
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${post.image})` }}
                            />
                            <div className="absolute inset-0 dark:bg-blue-900/40 bg-blue-600/40" />
                            {country && (
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 dark:text-gray-900 text-blue-900">
                                  <MapPin className="h-3 w-3 mr-1 dark:text-gray-600 text-blue-600" />
                                  {country.name}
                                </Badge>
                              </div>
                            )}
                            {post.rating > 0 && (
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-yellow-500 text-white">
                                  <Star className="h-3 w-3 mr-1" />
                                  {post.rating}/5
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                        <CardContent className="p-6 dark:bg-gray-800 bg-white">
                          <div className="flex items-start space-x-3 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.userAvatar} alt={post.userName} />
                              <AvatarFallback className="dark:bg-gray-700 bg-blue-600 text-white">
                                {post.userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg dark:text-gray-200 text-blue-900 mb-1">{post.title}</h3>
                              <div className="flex items-center space-x-2 text-sm dark:text-gray-400 text-blue-700">
                                <span>{post.userName}</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3 dark:text-gray-400 text-blue-600" />
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="dark:text-gray-400 text-blue-800 mb-4 line-clamp-3">
                            {post.content}
                          </p>
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="dark:text-gray-200 dark:bg-gray-700 text-blue-900 bg-blue-100">
                                  #{tag}
                                </Badge>
                              ))}
                              {post.tags.length > 3 && (
                                <Badge variant="outline" className="dark:text-gray-200 text-blue-900">
                                  +{post.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 text-sm dark:text-gray-400 text-blue-600">
                                <ThumbsUp className="h-4 w-4 dark:text-gray-400" />
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm dark:text-gray-400 text-blue-600">
                                <MessageCircle className="h-4 w-4 dark:text-gray-400" />
                                <span>{post.comments.length}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm dark:text-gray-400 text-blue-600">
                                <Eye className="h-4 w-4 dark:text-gray-400" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="dark:text-gray-400 dark:hover:text-gray-200 text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setSelectedPost(post);
                                setPosts(prevPosts =>
                                  prevPosts.map(p =>
                                    p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p
                                  )
                                );
                              }}
                            >
                              Lire
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-5 w-5 dark:text-gray-400" />
                </Button>
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full w-10 h-10 p-0 ${currentPage === page ? 'dark:bg-gray-700 dark:text-gray-200 bg-blue-600 text-white' : 'dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 border-blue-200 hover:bg-blue-600 hover:text-white'} transition-colors`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-5 w-5 dark:text-gray-400" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 dark:bg-gray-900">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 dark:text-gray-400 text-blue-600" />
              <h3 className="text-xl font-semibold dark:text-gray-200 text-blue-900 mb-2">
                Aucune expérience trouvée
              </h3>
              <p className="dark:text-gray-400 text-blue-700 mb-6">
                Soyez le premier à partager votre expérience !
              </p>
              {isAuthenticated && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="dark:bg-blue-600 dark:hover:bg-blue-500 bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" /> Partager mon expérience
                </Button>
              )}
            </div>
          )}
        </div>
        {selectedPost && (
          <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
            <DialogContent className="max-w-3xl dark:bg-gray-800 dark:border-gray-700 bg-white border-blue-200">
              <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onUpdatePost={setPosts} />
            </DialogContent>
          </Dialog>
        )}
      </section>
    </div>
  );
}