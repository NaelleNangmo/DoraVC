'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Star, 
  MapPin, 
  Calendar, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
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

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (postId: number) => void;
  onDislike: (postId: number) => void;
}

export function PostDetailModal({ post, isOpen, onClose, onLike, onDislike }: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const { user, isAuthenticated } = useAuth();

  if (!post) return null;

  const handleAddComment = () => {
    if (!newComment.trim() || !isAuthenticated) {
      toast.error('Veuillez vous connecter et écrire un commentaire');
      return;
    }

    const comment: Comment = {
      id: Date.now(),
      userId: user?.id || 0,
      userName: user?.name || 'Utilisateur',
      userAvatar: user?.avatar || '',
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    toast.success('Commentaire ajouté !');
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass-effect border-0 p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.5 }}
          className="preserve-3d h-full"
        >
          {/* Header */}
          <DialogHeader className="p-6 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
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
                <div>
                  <DialogTitle className="text-xl font-bold">{post.title}</DialogTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{post.userName}</span>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.createdAt)}</span>
                    {post.countryName && (
                      <>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{post.countryName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </DialogHeader>

          {/* Content */}
          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="p-6 space-y-6">
              {/* Image */}
              {post.image && (
                <motion.div
                  className="relative h-64 overflow-hidden rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
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
                </motion.div>
              )}

              {/* Content */}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
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
                </div>
              )}

              {/* Stats and Actions */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg glass-effect">
                <div className="flex items-center space-x-6">
                  <motion.button
                    onClick={() => onLike(post.id)}
                    className={`flex items-center space-x-2 text-sm transition-colors ${
                      post.userLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsUp className={`h-5 w-5 ${post.userLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => onDislike(post.id)}
                    className={`flex items-center space-x-2 text-sm transition-colors ${
                      post.userDisliked ? 'text-blue-600' : 'text-muted-foreground hover:text-blue-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ThumbsDown className={`h-5 w-5 ${post.userDisliked ? 'fill-current' : ''}`} />
                    <span>{post.dislikes}</span>
                  </motion.button>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    <span>{comments.length} commentaires</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Eye className="h-5 w-5" />
                    <span>{post.views} vues</span>
                  </div>
                </div>

                {/* Rating */}
                {isAuthenticated && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Noter :</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-lg ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                        >
                          <Star className={`h-4 w-4 ${star <= rating ? 'fill-current' : ''}`} />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Commentaires ({comments.length})
                </h3>

                {/* Add Comment */}
                {isAuthenticated ? (
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Ajouter un commentaire..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] glass-effect border-border/50"
                        />
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            onClick={handleAddComment}
                            size="sm"
                            disabled={!newComment.trim()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Publier
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg glass-effect"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-blue-700 dark:text-blue-300">
                      Connectez-vous pour ajouter un commentaire
                    </p>
                  </motion.div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex space-x-3 p-3 bg-background/50 rounded-lg glass-effect"
                        whileHover={{ scale: 1.01, x: 5 }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
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
                            <motion.button
                              className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-red-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Heart className="h-3 w-3" />
                              <span>{comment.likes}</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {comments.length === 0 && (
                    <motion.div 
                      className="text-center py-8 text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun commentaire pour le moment</p>
                      <p className="text-sm">Soyez le premier à commenter !</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}