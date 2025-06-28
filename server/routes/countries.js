import express from 'express';
import { Country } from '../models/Country.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les pays
router.get('/', async (req, res) => {
  try {
    const countries = await Country.getAll();
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Récupérer un pays par code
router.get('/:code', async (req, res) => {
  try {
    const country = await Country.findByCode(req.params.code);
    
    if (!country) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pays non trouvé' 
      });
    }

    res.json({
      success: true,
      data: country
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du pays:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Créer un nouveau pays (admin seulement)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const country = await Country.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Pays créé avec succès',
      data: country
    });
  } catch (error) {
    console.error('Erreur lors de la création du pays:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Mettre à jour un pays (admin seulement)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const country = await Country.update(req.params.id, req.body);
    
    if (!country) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pays non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Pays mis à jour avec succès',
      data: country
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du pays:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Supprimer un pays (admin seulement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const country = await Country.delete(req.params.id);
    
    if (!country) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pays non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Pays supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du pays:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

export default router;