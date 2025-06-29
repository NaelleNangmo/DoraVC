'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Globe, 
  BarChart3, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  MessageCircle,
  Star,
  Shield,
  Sparkles,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  joinedDate?: string;
  preferences?: {
    language: string;
    currency: string;
  };
}

interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  continent: string;
  capital: string;
  currency: string;
  language: string;
  image: string;
  description: string;
  visaRequired: boolean;
  processingTime: string;
  averageCost: number;
  popularSeason: string;
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adminCountries, setAdminCountries] = useState<Country[]>(countries);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditCountryModalOpen, setIsEditCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    // Charger les données
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }

    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Utilisateurs par défaut
      const defaultUsers = [
        {
          id: 1,
          name: "Jean Dupont",
          email: "jean@example.com",
          role: "user" as const,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          joinedDate: "2024-01-15"
        },
        {
          id: 2,
          name: "Marie Martin",
          email: "marie@example.com",
          role: "user" as const,
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          joinedDate: "2024-02-20"
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Vérification d'accès admin sans redirection automatique
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="h-32 w-32 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        >
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Vous devez être administrateur pour accéder à cette page.
          </p>
          <Button asChild>
            <a href="/">Retour à l'accueil</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleApprovePost = (postId: number) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, status: 'approved' as const, approvedAt: new Date().toISOString() }
        : post
    );
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    toast.success('Post approuvé avec succès');
  };

  const handleRejectPost = (postId: number) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, status: 'rejected' as const }
        : post
    );
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    toast.success('Post rejeté');
  };

  const handleDeletePost = (postId: number) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    toast.success('Post supprimé');
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setIsEditCountryModalOpen(true);
  };

  const handleSaveCountry = () => {
    if (!editingCountry) return;

    const updatedCountries = adminCountries.map(country =>
      country.id === editingCountry.id ? editingCountry : country
    );
    setAdminCountries(updatedCountries);
    localStorage.setItem('countries', JSON.stringify(updatedCountries));
    setIsEditCountryModalOpen(false);
    setEditingCountry(null);
    toast.success('Pays mis à jour avec succès');
  };

  const handleDeleteCountry = (countryId: number) => {
    const updatedCountries = adminCountries.filter(country => country.id !== countryId);
    setAdminCountries(updatedCountries);
    localStorage.setItem('countries', JSON.stringify(updatedCountries));
    toast.success('Pays supprimé');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    totalPosts: posts.length,
    pendingPosts: posts.filter(p => p.status === 'pending').length,
    approvedPosts: posts.filter(p => p.status === 'approved').length,
    totalCountries: adminCountries.length,
    totalViews: posts.reduce((sum, post) => sum + post.views, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-white flex items-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="mr-3"
                >
                  <Shield className="h-8 w-8" />
                </motion.div>
                Tableau de bord Admin
              </h1>
              <p className="text-blue-100">Gérez votre plateforme DORA</p>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Avatar className="h-12 w-12 ring-2 ring-white/30">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-sm text-blue-100 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrateur
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <TabsList className="grid w-full grid-cols-4 glass-effect border-0 shadow-lg">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Tableau de bord
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-white/20">
                  <FileText className="h-4 w-4 mr-2" />
                  Posts ({stats.pendingPosts})
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-white/20">
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger value="countries" className="data-[state=active]:bg-white/20">
                  <Globe className="h-4 w-4 mr-2" />
                  Pays
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { icon: Users, value: stats.totalUsers, label: 'Utilisateurs', color: 'blue', delay: 0.1 },
                  { icon: FileText, value: stats.totalPosts, label: 'Posts totaux', color: 'green', delay: 0.2 },
                  { icon: MessageCircle, value: stats.pendingPosts, label: 'En attente', color: 'orange', delay: 0.3 },
                  { icon: Globe, value: stats.totalCountries, label: 'Pays', color: 'purple', delay: 0.4 }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, rotateY: 20 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.6, delay: stat.delay }}
                    whileHover={{ 
                      y: -5, 
                      rotateY: 10,
                      scale: 1.02,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                    }}
                    className="preserve-3d"
                  >
                    <Card className="glass-effect border-0 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className={`p-3 rounded-full bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 text-white`}
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <stat.icon className="h-6 w-6" />
                          </motion.div>
                          <div>
                            <motion.p 
                              className="text-2xl font-bold"
                              animate={{ 
                                textShadow: [
                                  '0 0 0px rgba(59, 130, 246, 0)',
                                  '0 0 10px rgba(59, 130, 246, 0.5)',
                                  '0 0 0px rgba(59, 130, 246, 0)'
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            >
                              {stat.value}
                            </motion.p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      <Activity className="h-5 w-5 mr-2" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {posts.slice(0, 5).map((post, index) => (
                        <motion.div 
                          key={post.id} 
                          className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg glass-effect"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5, scale: 1.02 }}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.userAvatar} alt={post.userName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {post.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{post.userName} a publié "{post.title}"</p>
                            <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <Badge variant={post.status === 'approved' ? 'default' : post.status === 'pending' ? 'secondary' : 'destructive'}>
                            {post.status === 'approved' ? 'Approuvé' : post.status === 'pending' ? 'En attente' : 'Rejeté'}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher des posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 glass-effect border-border/50"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 glass-effect border-border/50">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Approuvés</SelectItem>
                      <SelectItem value="rejected">Rejetés</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 30, rotateY: 10 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      exit={{ opacity: 0, y: -30, rotateY: -10 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ 
                        y: -5, 
                        rotateY: 5,
                        scale: 1.01,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                      }}
                      className="preserve-3d"
                    >
                      <Card className="glass-effect border-0 shadow-xl">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotateY: 15 }}
                            >
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={post.userAvatar} alt={post.userName} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {post.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <motion.h3 
                                    className="font-semibold text-lg"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    {post.title}
                                  </motion.h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Par {post.userName} • {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                                    {post.countryName && ` • ${post.countryName}`}
                                  </p>
                                  <p className="text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span className="flex items-center space-x-1">
                                      <TrendingUp className="h-4 w-4" />
                                      <span>{post.likes} likes</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <MessageCircle className="h-4 w-4" />
                                      <span>{post.comments} commentaires</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Eye className="h-4 w-4" />
                                      <span>{post.views} vues</span>
                                    </span>
                                    {post.rating && (
                                      <span className="flex items-center space-x-1">
                                        <Star className="h-4 w-4" />
                                        <span>{post.rating}/5</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Badge variant={post.status === 'approved' ? 'default' : post.status === 'pending' ? 'secondary' : 'destructive'}>
                                    {post.status === 'approved' ? 'Approuvé' : post.status === 'pending' ? 'En attente' : 'Rejeté'}
                                  </Badge>
                                  
                                  {post.status === 'pending' && (
                                    <>
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          size="sm"
                                          onClick={() => handleApprovePost(post.id)}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleRejectPost(post.id)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                    </>
                                  )}
                                  
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeletePost(post.id)}
                                      className="glass-effect border-border/50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      <Users className="h-5 w-5 mr-2" />
                      Gestion des utilisateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((user, index) => (
                        <motion.div 
                          key={user.id} 
                          className="flex items-center justify-between p-4 bg-background/50 rounded-lg glass-effect"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5, scale: 1.02 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div
                              whileHover={{ scale: 1.1, rotateY: 15 }}
                            >
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              {user.joinedDate && (
                                <p className="text-xs text-muted-foreground">
                                  Inscrit le {new Date(user.joinedDate).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                            </Badge>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button size="sm" variant="outline" className="glass-effect border-border/50">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Countries Tab */}
            <TabsContent value="countries" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Gestion des pays
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un pays
                  </Button>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCountries.map((country, index) => (
                  <motion.div
                    key={country.id}
                    initial={{ opacity: 0, y: 30, rotateY: 20 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -10, 
                      rotateY: 10,
                      scale: 1.02,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                    }}
                    className="preserve-3d"
                  >
                    <Card className="h-full glass-effect border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                      <div className="relative h-32 overflow-hidden rounded-t-lg">
                        <motion.div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${country.image})` }}
                          whileHover={{ scale: 1.1, rotateX: 5 }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className="absolute top-2 right-2">
                          <motion.span 
                            className="text-2xl"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          >
                            {country.flag}
                          </motion.span>
                        </div>
                      </div>
                      <CardContent className="p-4 bg-background/80 backdrop-blur-sm">
                        <motion.h3 
                          className="font-semibold text-lg mb-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          {country.name}
                        </motion.h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {country.description}
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground mb-4">
                          <p><strong>Continent:</strong> {country.continent}</p>
                          <p><strong>Capitale:</strong> {country.capital}</p>
                          <p><strong>Visa requis:</strong> {country.visaRequired ? 'Oui' : 'Non'}</p>
                          {country.visaRequired && (
                            <p><strong>Coût:</strong> {country.averageCost}€</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCountry(country)}
                              className="glass-effect border-border/50"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Modifier
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCountry(country.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit Country Modal */}
      <Dialog open={isEditCountryModalOpen} onOpenChange={setIsEditCountryModalOpen}>
        <DialogContent className="max-w-2xl glass-effect border-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.5 }}
            className="preserve-3d"
          >
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Modifier le pays
              </DialogTitle>
            </DialogHeader>
            {editingCountry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      value={editingCountry.name}
                      onChange={(e) => setEditingCountry({ ...editingCountry, name: e.target.value })}
                      className="glass-effect border-border/50"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={editingCountry.code}
                      onChange={(e) => setEditingCountry({ ...editingCountry, code: e.target.value })}
                      className="glass-effect border-border/50"
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="continent">Continent</Label>
                    <Input
                      id="continent"
                      value={editingCountry.continent}
                      onChange={(e) => setEditingCountry({ ...editingCountry, continent: e.target.value })}
                      className="glass-effect border-border/50"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="capital">Capitale</Label>
                    <Input
                      id="capital"
                      value={editingCountry.capital}
                      onChange={(e) => setEditingCountry({ ...editingCountry, capital: e.target.value })}
                      className="glass-effect border-border/50"
                    />
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                >
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingCountry.description}
                    onChange={(e) => setEditingCountry({ ...editingCountry, description: e.target.value })}
                    className="glass-effect border-border/50"
                  />
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="processingTime">Délai de traitement</Label>
                    <Input
                      id="processingTime"
                      value={editingCountry.processingTime}
                      onChange={(e) => setEditingCountry({ ...editingCountry, processingTime: e.target.value })}
                      className="glass-effect border-border/50"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="averageCost">Coût moyen (€)</Label>
                    <Input
                      id="averageCost"
                      type="number"
                      value={editingCountry.averageCost}
                      onChange={(e) => setEditingCountry({ ...editingCountry, averageCost: parseInt(e.target.value) })}
                      className="glass-effect border-border/50"
                    />
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleSaveCountry} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sauvegarder les modifications
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}