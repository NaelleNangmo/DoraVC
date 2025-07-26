'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, ThumbsUp, MessageCircle, Eye, Star, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Post {
  id: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  title: string;
  content: string;
  image: string;
  status: string;
  countryId?: number;
  rating: number;
  createdAt: string;
  approvedAt?: string;
  tags: string[];
  likes: number;
  comments: string[] | string | undefined;
  dislikes: number;
  views: number;
}

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
  onUpdatePost: (updater: (prev: Post[]) => Post[]) => Post[];
}

export default function PostDetailModal({ post, onClose, onUpdatePost }: PostDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [localLikes, setLocalLikes] = useState(post?.likes || 0);
  const [localDislikes, setLocalDislikes] = useState(post?.dislikes || 0);
  const [localViews, setLocalViews] = useState(post?.views || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (post) {
      setLocalLikes(post.likes || 0);
      setLocalDislikes(post.dislikes || 0);
      setLocalViews(post.views || 0);
      setHasLiked(false);
      setHasDisliked(false);
    }
  }, [post]);

  if (!post) return null;

  const country = [
    { id: 1, name: 'Canada', flag: '🇨🇦' },
    { id: 3, name: 'Japon', flag: '🇯🇵' },
    { id: 4, name: 'États-Unis', flag: '🇺🇸' },
  ].find(c => c.id === post.countryId);

  const normalizeComments = (comments: string[] | string | undefined): string[] => {
    if (Array.isArray(comments)) return comments;
    if (typeof comments === 'string') return [comments];
    return [];
  };

  const commentsArray = normalizeComments(post.comments);

  const handleAddComment = () => {
    if (newComment.trim() && user) {
      const currentComments = normalizeComments(post.comments);
      onUpdatePost((prev) =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, comments: [...currentComments, `${user.name}: ${newComment}`] }
            : p
        )
      );
      setNewComment('');
    } else if (!user) {
      alert('Vous devez être connecté pour ajouter un commentaire.');
    }
  };

  const handleLike = () => {
    if (!hasLiked && user) {
      setLocalLikes(localLikes + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setLocalDislikes(localDislikes - 1);
        onUpdatePost((prev) =>
          prev.map(p =>
            p.id === post.id ? { ...p, likes: p.likes + 1, dislikes: p.dislikes - 1 } : p
          )
        );
        setHasDisliked(false);
      } else {
        onUpdatePost((prev) =>
          prev.map(p =>
            p.id === post.id ? { ...p, likes: p.likes + 1 } : p
          )
        );
      }
    } else if (!user) {
      alert('Vous devez être connecté pour liker.');
    }
  };

  const handleDislike = () => {
    if (!hasDisliked && user) {
      setLocalDislikes(localDislikes + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLocalLikes(localLikes - 1);
        onUpdatePost((prev) =>
          prev.map(p =>
            p.id === post.id ? { ...p, dislikes: p.dislikes + 1, likes: p.likes - 1 } : p
          )
        );
        setHasLiked(false);
      } else {
        onUpdatePost((prev) =>
          prev.map(p =>
            p.id === post.id ? { ...p, dislikes: p.dislikes + 1 } : p
          )
        );
      }
    } else if (!user) {
      alert('Vous devez être connecté pour disliker.');
    }
  };

  const handleRate = (rating: number) => {
    if (user) {
      setUserRating(rating);
      const currentComments = normalizeComments(post.comments);
      onUpdatePost((prev) =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, rating: (p.rating * (currentComments.length) + rating) / (currentComments.length + 1) }
            : p
        )
      );
    } else {
      alert('Vous devez être connecté pour noter.');
    }
  };

  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-white/90 to-blue-50 dark:from-gray-800/90 dark:to-gray-900 border border-blue-200/50 dark:border-gray-700/50 rounded-xl shadow-xl p-6 transition-all duration-300">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-bold text-blue-900 dark:text-gray-100 bg-gradient-to-r from-blue-100 to-transparent dark:from-gray-700/50 p-2 rounded-lg">
            {post.title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {post.image && (
              <div className="relative w-full h-64 overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.image})` }}
                />
                {country && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/80 text-blue-900 dark:text-gray-200 dark:bg-gray-700/70 backdrop-blur-sm">
                      <MapPin className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                      {country.name}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-14 w-14 border-2 border-blue-200/50 dark:border-gray-700/50 shadow-sm">
                <AvatarImage src={post.userAvatar} alt={post.userName} />
                <AvatarFallback className="bg-blue-600 dark:bg-gray-700 text-white text-lg">
                  {post.userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xl font-semibold text-blue-900 dark:text-gray-100">{post.userName}</h4>
                <p className="text-sm text-blue-700 dark:text-gray-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="prose dark:prose-invert max-w-none text-blue-800 dark:text-gray-300 leading-relaxed">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-blue-900 dark:text-gray-200 bg-blue-100/70 dark:bg-gray-700/50 hover:bg-blue-200/70 dark:hover:bg-gray-600/70 transition-colors duration-200"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center space-x-6 mt-4">
              <Button
                variant={hasLiked ? 'default' : 'ghost'}
                size="sm"
                className={`text-blue-600 dark:text-blue-400 ${hasLiked ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 dark:hover:bg-blue-900'}`}
                onClick={handleLike}
                disabled={hasLiked || !user}
              >
                <ThumbsUp className="h-5 w-5 mr-1" />
                <span>{localLikes}</span>
              </Button>
              <Button
                variant={hasDisliked ? 'default' : 'ghost'}
                size="sm"
                className={`text-red-600 dark:text-red-400 ${hasDisliked ? 'bg-red-600 text-white' : 'hover:bg-red-100 dark:hover:bg-red-900'}`}
                onClick={handleDislike}
                disabled={hasDisliked || !user}
              >
                <ThumbsDown className="h-5 w-5 mr-1" />
                <span>{localDislikes}</span>
              </Button>
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Eye className="h-5 w-5" />
                <span className="text-lg font-medium">{localViews}</span>
              </div>
              {post.rating > 0 && (
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                  <Star className="h-5 w-5" />
                  <span className="text-lg font-medium">{post.rating.toFixed(1)}/5</span>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Label htmlFor="comment" className="text-blue-900 dark:text-gray-100">Ajouter un commentaire</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrivez votre commentaire..."
                  className="flex-1 border border-blue-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 text-blue-900 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!user}
                />
                <Button
                  onClick={handleAddComment}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 rounded-lg transition-all duration-200"
                  disabled={!user}
                >
                  Envoyer
                </Button>
              </div>
              <div className="mt-4 max-h-40 overflow-y-auto">
                {commentsArray.length > 0 ? (
                  <>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-gray-100 mb-2">Commentaires</h4>
                    {commentsArray.map((comment, index) => (
                      <p
                        key={index}
                        className="text-blue-800 dark:text-gray-300 bg-blue-50 dark:bg-gray-700/50 p-2 rounded-md mb-2 last:mb-0"
                      >
                        {comment}
                      </p>
                    ))}
                  </>
                ) : (
                  <p className="text-blue-700 dark:text-gray-400 italic">Aucun commentaire pour le moment.</p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <Label className="text-blue-900 dark:text-gray-100">Notez ce post</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={userRating === star ? 'default' : 'outline'}
                    size="sm"
                    className={`text-yellow-500 ${userRating === star ? 'bg-yellow-500 text-white' : 'hover:bg-yellow-100 dark:hover:bg-yellow-900'}`}
                    onClick={() => handleRate(star)}
                    disabled={!user}
                  >
                    ★
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 rounded-lg shadow-md transition-all duration-200"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}