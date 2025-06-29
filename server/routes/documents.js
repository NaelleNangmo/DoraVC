import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${req.user.userId}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Types de fichiers autorisés
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Upload de documents
router.post('/upload', authenticateToken, upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      id: Date.now() + Math.random(),
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: new Date(),
      userId: req.user.userId
    }));

    // Ici vous pourriez sauvegarder les informations en base de données
    // Pour l'instant, on retourne juste les informations des fichiers

    res.json({
      success: true,
      message: 'Fichiers uploadés avec succès',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des fichiers'
    });
  }
});

// Télécharger un document
router.get('/download/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Vérifier que le fichier appartient à l'utilisateur (basé sur le nom du fichier)
    if (!filename.startsWith(`${req.user.userId}-`)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.download(filePath);

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement'
    });
  }
});

// Lister les documents de l'utilisateur
router.get('/list', authenticateToken, (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        files: []
      });
    }

    const files = fs.readdirSync(uploadsDir)
      .filter(filename => filename.startsWith(`${req.user.userId}-`))
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          originalName: filename.split('-').slice(2).join('-'), // Enlever l'ID utilisateur et le timestamp
          size: stats.size,
          uploadDate: stats.birthtime,
          downloadUrl: `/api/documents/download/${filename}`
        };
      });

    res.json({
      success: true,
      files
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers'
    });
  }
});

// Supprimer un document
router.delete('/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);

    // Vérifier que le fichier appartient à l'utilisateur
    if (!filename.startsWith(`${req.user.userId}-`)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Supprimer le fichier
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier'
    });
  }
});

export default router;