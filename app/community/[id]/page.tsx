'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Star,
  MapPin,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  User,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { communityService, type CommunityPost } from '@/lib/services/communityService';
import { toast } from 'sonner';

interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true);
        const postData = await communityService.getPost(Number(params.id));
        if (postData) {
          setPost(postData);
          // Charger les commentaires depuis le localStorage
          const savedComments = localStorage.getItem(`comments_${params.id}`);
          if (savedComments) {
            setComments(JSON.parse(savedComments));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du post:', error);
        toast.error('Erreur lors du chargement du post');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadPost();
    }
  }, [params.id]);

  const handleLike = async () => {
    if (!isAuthenticated || !post) {
      toast.error('Connectez-vous pour interagir avec les posts');
      return;
    }

    try {
      const newLikes = post.userLiked ? post.likes - 1 : post.likes + 1;
      const newDislikes = post.userDisliked ? post.dislikes - 1 : post.dislikes;

      const updatedPost = await communityService.updateLikes(post.id, newLikes, newDislikes);
      
      if (updatedPost) {
        setPost({
          ...updatedPost,
          userLiked: !post.userLiked,
          userDisliked: false
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des likes:', error);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated || !post) {
      toast.error('Connectez-vous pour interagir avec les posts');
      return;
    }

    try {
      const newDislikes = post.userDisliked ? post.dislikes - 1 : post.dislikes + 1;
      const newLikes = post.userLiked ? post.likes - 1 : post.likes;

      const updatedPost = await communityService.updateLikes(post.id, newLikes, newDislikes);
      
      if (updatedPost) {
        setPost({
          ...updatedPost,
          userDisliked: !post.userDisliked,
          userLiked: false
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des dislikes:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !newComment.trim() || !post) {
      toast.error('Connectez-vous et écrivez un commentaire');
      return;
    }

    try {
      setIsSubmittingComment(true);
      
      const comment: Comment = {
        id: Date.now(),
        userId: user?.id || 0,
        userName: user?.name || 'Utilisateur',
        userAvatar: user?.avatar || '',
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      
      // Sauvegarder dans localStorage
      localStorage.setItem(`comments_${params.id}`, JSON.stringify(updatedComments));
      
      // Mettre à jour le nombre de commentaires du post
      setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
      
      setNewComment('');
      toast.success('Commentaire ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!isAuthenticated || userRating === 0 || !post) {
      toast.error('Connectez-vous et sélectionnez une note');
      return;
    }

    try {
      setIsSubmittingRating(true);
      
      // Sauvegarder la note dans localStorage
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
      userRatings[`post_${post.id}`] = userRating;
      localStorage.setItem('userRatings', JSON.stringify(userRatings));
      
      toast.success('Note enregistrée avec succès');
      setUserRating(0);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la note:', error);
      toast.error('Erreur lors de l\'enregistrement de la note');
    } finally {
      setIsSubmittingRating(false);
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

  if (isLoading) {
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post non trouvé</h1>
          <Button asChild>
            <Link href="/community">Retour à la communauté</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
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
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 glass-effect"
              >
                <Link href="/community" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la communauté
                </Link>
              </Button>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl font-bold text-white">
                Détails du post
              </h1>
              <p className="text-sm text-blue-100">
                Partagé par {post.userName}
              </p>
            </motion.div>

            <div className="w-24"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Post Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="glass-effect border-0 shadow-xl">
                  {post.image && (
                    <div className="relative h-64 overflow-hidden rounded-t-lg">
                      <motion.div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${post.image})` }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {post.countryName && (
                        <motion.div 
                          className="absolute top-4 left-4"
                          whileHover={{ scale: 1.1 }}
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
                          whileHover={{ scale: 1.1 }}
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
                    <div className="flex items-start space-x-4 mb-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.userAvatar} alt={post.userName} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {post.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{post.userName}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.views} vues</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post Content with Scroll */}
                    <ScrollArea className="max-h-96 mb-6">
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </div>
                    </ScrollArea>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.map((tag, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <Badge variant="secondary" className="glass-effect">
                              #{tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center space-x-4">
                        <motion.button
                          onClick={handleLike}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            post.userLiked 
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ThumbsUp className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={handleDislike}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            post.userDisliked 
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ThumbsDown className={`h-4 w-4 ${post.userDisliked ? 'fill-current' : ''}`} />
                          <span>{post.dislikes}</span>
                        </motion.button>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{comments.length} commentaires</span>
                        </div>
                      </div>

                      <motion.button
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Partager</span>
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8"
              >
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Commentaires ({comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add Comment */}
                    {isAuthenticated ? (
                      <div className="mb-6">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <Textarea
                              placeholder="Écrivez votre commentaire..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="glass-effect border-border/50"
                            />
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || isSubmittingComment}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {isSubmittingComment ? 'Envoi...' : 'Commenter'}
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                        <p className="text-blue-700 dark:text-blue-300 mb-2">
                          Connectez-vous pour laisser un commentaire
                        </p>
                        <Button asChild variant="outline">
                          <Link href="/auth">Se connecter</Link>
                        </Button>
                      </div>
                    )}

                    <Separator className="mb-6" />

                    {/* Comments List */}
                    <ScrollArea className="max-h-96">
                      <div className="space-y-4">
                        {comments.length > 0 ? (
                          comments.map((comment, index) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start space-x-3 p-3 bg-background/50 rounded-lg glass-effect"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-sm">
                                  {comment.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{comment.userName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground">{comment.content}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground">
                                    <Heart className="h-3 w-3" />
                                    <span>{comment.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun commentaire pour le moment</p>
                            <p className="text-sm">Soyez le premier à commenter !</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rating Section */}
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass-effect border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-500" />
                        Noter ce post
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              onClick={() => setUserRating(star)}
                              className={`p-1 ${
                                star <= userRating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Star className={`h-6 w-6 ${star <= userRating ? 'fill-current' : ''}`} />
                            </motion.button>
                          ))}
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleSubmitRating}
                            disabled={userRating === 0 || isSubmittingRating}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {isSubmittingRating ? 'Envoi...' : 'Noter'}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Post Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Vues</span>
                        <span className="font-medium">{post.views}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Likes</span>
                        <span className="font-medium text-green-600">{post.likes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Commentaires</span>
                        <span className="font-medium text-blue-600">{comments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Note moyenne</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{post.rating || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Related Posts */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Posts similaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center py-4 text-muted-foreground">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun post similaire trouvé</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}