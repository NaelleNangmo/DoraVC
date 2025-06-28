import express from 'express';
import { CommunityPost } from '../models/CommunityPost.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les posts (approuvés pour les utilisateurs, tous pour les admins)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const isAdmin = req.user?.role === 'admin';
    
    const posts = await CommunityPost.getAll(
      isAdmin ? status : 'approved'
    );
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Récupérer un post par ID
router.get('/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post non trouvé' 
      });
    }

    // Incrémenter les vues
    await CommunityPost.incrementViews(req.params.id);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Créer un nouveau post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      user_id: req.user.userId
    };

    const post = await CommunityPost.create(postData);
    
    res.status(201).json({
      success: true,
      message: 'Post créé avec succès',
      data: post
    });
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Mettre à jour le statut d'un post (admin seulement)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Statut invalide' 
      });
    }

    const post = await CommunityPost.updateStatus(req.params.id, status);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: post
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Mettre à jour les likes/dislikes
router.patch('/:id/likes', authenticateToken, async (req, res) => {
  try {
    const { likes, dislikes } = req.body;
    
    const post = await CommunityPost.updateLikes(req.params.id, likes, dislikes);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Likes mis à jour avec succès',
      data: post
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des likes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Supprimer un post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post non trouvé' 
      });
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    if (post.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé' 
      });
    }

    await CommunityPost.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

export default router;