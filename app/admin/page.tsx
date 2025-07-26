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
import usersData from '../../data/users.json'; // Vérifiez ce chemin
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';

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
  comments: number;
  views?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  joinedDate?: string;
  preferences?: {
    language: string;
    currency: string;
  };
  suspended?: boolean;
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
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const itemsPerPage = 6; // Nombre d'éléments par page

  useEffect(() => {
    // Tentative d'import statique
    import('../../data/posts.json')
      .then((module) => {
        const data = module.default;
        console.log('Imported postsData:', data);
        if (Array.isArray(data)) {
          setPosts(data as Post[]);
        } else {
          console.error('Données invalides:', data);
        }
      })
      .catch((error) => {
        console.error('Erreur d\'import:', error);
        // Fallback avec fetch
        fetch('/data/posts.json')
          .then((response) => {
            if (!response.ok) throw new Error('Fichier non trouvé');
            return response.json();
          })
          .then((data) => {
            console.log('Fetched postsData:', data);
            if (Array.isArray(data)) {
              setPosts(data as Post[]);
            } else {
              console.error('Données invalides:', data);
            }
          })
          .catch((error) => console.error('Erreur de fetch:', error));
      });

    // Chargement des utilisateurs
    if (usersData && Array.isArray(usersData)) {
      setUsers(usersData as User[]);
    } else {
      console.error('usersData est invalide ou vide:', usersData);
    }

    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('users', JSON.stringify(usersData));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-blue-900">
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
      <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-blue-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
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
    if (currentPage > Math.ceil(updatedCountries.length / itemsPerPage)) {
      setCurrentPage(Math.max(1, Math.ceil(updatedCountries.length / itemsPerPage)));
    }
  };

  const handleSuspendUser = (userId: number) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, suspended: !user.suspended } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success(user.suspended ? 'Utilisateur réactivé avec succès' : 'Utilisateur suspendu avec succès');
  };

  const handleDeleteUser = (userId: number) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('Utilisateur supprimé avec succès');
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
    totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0)
  };

  // Pagination pour les pays
  const indexOfLastCountry = currentPage * itemsPerPage;
  const indexOfFirstCountry = indexOfLastCountry - itemsPerPage;
  const currentCountries = adminCountries.slice(indexOfFirstCountry, indexOfLastCountry);
  const totalPages = Math.ceil(adminCountries.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Générer les pages visibles (5 pages max autour de la page courante)
  const siblingCount = 2;
  const totalPageNumbers = siblingCount * 2 + 3;
  let startPage = Math.max(1, currentPage - siblingCount);
  let endPage = Math.min(totalPages, currentPage + siblingCount);
  
  const paginationRange = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
      <section className="bg-blue-600 shadow-lg relative overflow-hidden">
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
              <Avatar className="h-12 w-12 ring-2 ring-blue-700/30">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-blue-700 text-white">
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

      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-blue-200/30 rounded-lg shadow-md">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Tableau de bord
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Posts ({stats.pendingPosts})
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger value="countries" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Globe className="h-4 w-4 mr-2" />
                  Pays
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="dashboard" className="mt-6">
              <AdminDashboardStats posts={posts} users={users} adminCountries={adminCountries} />
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500 dark:text-blue-300" />
                    <Input
                      placeholder="Rechercher des posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 bg-white/80 dark:bg-blue-800/80 border border-blue-200/30 rounded-lg shadow-sm"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-white/80 dark:bg-blue-800/80 border border-blue-200/30 rounded-lg shadow-sm">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/80 dark:bg-blue-800/80 border border-blue-200/30 rounded-lg">
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
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.01, boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}
                      >
                        <Card className="bg-white/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-200/30 shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                              >
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={post.userAvatar} alt={post.userName} />
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {post.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <motion.h3 
                                      className="font-semibold text-lg text-blue-900 dark:text-blue-100"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      {post.title}
                                    </motion.h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                      Par {post.userName} • {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                                      {post.countryName && ` • ${post.countryName}`}
                                    </p>
                                    <p className="text-blue-700 dark:text-blue-300 mb-3 line-clamp-2">{post.content}</p>
                                    <div className="flex items-center space-x-4 text-sm text-blue-700 dark:text-blue-300">
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
                                        <span>{post.views || 0} vues</span>
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
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                                        className="border-blue-200/50 text-blue-700 hover:bg-blue-50 dark:border-blue-700/50 dark:text-blue-300 dark:hover:bg-blue-900/50"
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
                    ))
                  ) : (
                    <p className="text-blue-700 dark:text-blue-300">Aucun post trouvé.</p>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="bg-white/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-200/30 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Gestion des utilisateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((user, index) => (
                        <motion.div 
                          key={user.id} 
                          className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/50 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5, scale: 1.02 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                            >
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div>
                              <p className="font-medium text-blue-900 dark:text-blue-100">{user.name}</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">{user.email}</p>
                              {user.joinedDate && (
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  Inscrit le {new Date(user.joinedDate).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                              {user.suspended && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  (Suspendu)
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
                              <Button
                                size="sm"
                                variant={user.suspended ? 'outline' : 'default'}
                                onClick={() => handleSuspendUser(user.id)}
                                className={`border-blue-200/50 text-blue-700 hover:bg-blue-100 dark:border-blue-700/50 dark:text-blue-300 dark:hover:bg-blue-900/50 ${user.suspended ? 'bg-blue-200/50 dark:bg-blue-900/50' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
                                disabled={user.role === 'admin'}
                              >
                                {user.suspended ? (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Réactiver
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Suspendre
                                  </>
                                )}
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id)}
                                className="border-gray-200/50 text-gray-700 hover:bg-gray-100 dark:border-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-900/50 bg-gray-700 text-white hover:bg-gray-800"
                                disabled={user.role === 'admin'}
                              >
                                <Trash2 className="h-4 w-4" />
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

            <TabsContent value="countries" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  className="text-2xl font-bold text-blue-900 dark:text-blue-100"
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
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un pays
                  </Button>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentCountries.map((country, index) => (
                  <motion.div
                    key={country.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}
                  >
                    <Card className="bg-white/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-200/30 shadow-lg">
                      <div className="relative h-32 overflow-hidden rounded-t-lg">
                        <motion.div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${country.image})` }}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="text-2xl">{country.flag}</span>
                        </div>
                      </div>
                      <CardContent className="p-4 bg-blue-50/50 dark:bg-blue-900/50">
                        <motion.h3 
                          className="font-semibold text-lg text-blue-900 dark:text-blue-100"
                          whileHover={{ scale: 1.02 }}
                        >
                          {country.name}
                        </motion.h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3 line-clamp-2">
                          {country.description}
                        </p>
                        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300 mb-4">
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
                              className="border-blue-200/50 text-blue-700 hover:bg-blue-50 dark:border-blue-700/50 dark:text-blue-300 dark:hover:bg-blue-900/50"
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

              {/* Pagination moderne */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    <span>&lt;</span>
                  </Button>
                  {paginationRange.map((page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded-full w-10 h-10 hover:bg-blue-200 dark:hover:bg-blue-700 ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                      variant={currentPage === page ? 'default' : 'outline'}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    <span>&gt;</span>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={isEditCountryModalOpen} onOpenChange={setIsEditCountryModalOpen}>
        <DialogContent className="max-w-2xl bg-white/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-200/30 rounded-lg shadow-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle className="text-blue-900 dark:text-blue-100">
                Modifier le pays
              </DialogTitle>
            </DialogHeader>
            {editingCountry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="name" className="text-blue-900 dark:text-blue-100">Nom</Label>
                    <Input
                      id="name"
                      value={editingCountry.name}
                      onChange={(e) => setEditingCountry({ ...editingCountry, name: e.target.value })}
                      className="bg-white/80 dark:bg-blue-900/50 border border-blue-200/30 rounded-lg"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="code" className="text-blue-900 dark:text-blue-100">Code</Label>
                    <Input
                      id="code"
                      value={editingCountry.code}
                      onChange={(e) => setEditingCountry({ ...editingCountry, code: e.target.value })}
                      className="bg-white/80 dark:bg-blue-900/50 border border-blue-200/30 rounded-lg"
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="continent" className="text-blue-900 dark:text-blue-100">Continent</Label>
                    <Input
                      id="continent"
                      value={editingCountry.continent}
                      onChange={(e) => setEditingCountry({ ...editingCountry, continent: e.target.value })}
                      className="bg-white/80 dark:bg-blue-900/50 border border-blue-200/30 rounded-lg"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="capital" className="text-blue-900 dark:text-blue-100">Capitale</Label>
                    <Input
                      id="capital"
                      value={editingCountry.capital}
                      onChange={(e) => setEditingCountry({ ...editingCountry, capital: e.target.value })}
                      className="bg-white/80 dark:bg-blue-900/50 border border-blue-200/30 rounded-lg"
                    />
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                >
                  <Label htmlFor="description" className="text-blue-900 dark:text-blue-100">Description</Label>
                  <Textarea
                    id="description"
                    value={editingCountry.description}
                    onChange={(e) => setEditingCountry({ ...editingCountry, description: e.target.value })}
                    className="bg-white/80 dark:bg-blue-900/50 border border-blue-200/30 rounded-lg"
                  />
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="processingTime" className="text-blue-900 dark:text-blue-100">Délai de traitement</Label>
                    <Input
                      id="processingTime"
                      value={editingCountry.processingTime}
                      onChange={(e) => setEditingCountry({ ...editingCountry, processingTime: e.target.value })}
                      className="bg-white/80 dark:bg-blue-900/50 border border-blue-200/30 rounded-lg"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                  >
                    <Label htmlFor="averageCost" className="text-blue-900 dark:text-blue-100">Coût moyen (€)</Label>
                    <Input
                      id="averageCost"
                      type="number"
                      value={editingCountry.averageCost}
                      onChange={(e) => setEditingCountry({ ...editingCountry, averageCost: parseInt(e.target.value) })}
                      className="bg-white/80 dark:bg-blue-900/50 border border-blue-200/30 rounded-lg"
                    />
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleSaveCountry} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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