import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pool from './config/database.js';
import initDatabase from './scripts/initDatabase.js';

// Routes
import authRoutes from './routes/auth.js';
import countriesRoutes from './routes/countries.js';
import communityRoutes from './routes/community.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});
app.use(limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/community', communityRoutes);

// Route de santé
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'API DORA opérationnelle',
      timestamp: new Date().toISOString(),
      database: 'Connectée'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de base de données',
      timestamp: new Date().toISOString(),
      database: 'Déconnectée'
    });
  }
});

// Route pour initialiser la base de données
app.post('/api/init-database', async (req, res) => {
  try {
    await initDatabase();
    res.json({
      success: true,
      message: 'Base de données initialisée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation de la base de données'
    });
  }
});

// Route par défaut
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API DORA - Digital Online Resource for Adventurers',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      countries: '/api/countries',
      community: '/api/community',
      health: '/api/health'
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await pool.query('SELECT 1');
    console.log('✅ Connexion à la base de données établie');

    // Initialiser la base de données automatiquement
    try {
      await initDatabase();
      console.log('✅ Base de données initialisée automatiquement');
    } catch (error) {
      console.log('ℹ️ Base de données déjà initialisée ou erreur d\'initialisation');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Serveur DORA démarré sur le port ${PORT}`);
      console.log(`📍 API disponible sur: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log('📊 Endpoints disponibles:');
      console.log('   - POST /api/auth/login');
      console.log('   - POST /api/auth/register');
      console.log('   - GET  /api/countries');
      console.log('   - GET  /api/community');
      console.log('   - POST /api/init-database');
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await pool.end();
  console.log('✅ Connexions fermées');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await pool.end();
  console.log('✅ Connexions fermées');
  process.exit(0);
});

startServer();