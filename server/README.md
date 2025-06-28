# Backend DORA

Backend pour l'application DORA (Digital Online Resource for Adventurers) avec PostgreSQL.

## 🚀 Démarrage rapide

### Installation des dépendances
```bash
cd server
npm install
```

### Configuration
Le fichier `.env` est déjà configuré avec la chaîne de connexion PostgreSQL fournie.

### Initialisation automatique
Le serveur initialise automatiquement la base de données au démarrage avec :
- ✅ Création de toutes les tables
- ✅ Insertion de données de test (5 enregistrements par table)
- ✅ Création d'un utilisateur admin et d'utilisateurs standards
- ✅ Index pour optimiser les performances

### Démarrage du serveur
```bash
npm start
# ou pour le développement avec auto-reload
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## 📊 Structure de la base de données

### Tables créées :
- **users** - Utilisateurs (admin + utilisateurs standards)
- **countries** - Pays et informations visa
- **hotels** - Hébergements par pays
- **restaurants** - Restaurants par pays
- **tourist_sites** - Sites touristiques par pays
- **community_posts** - Posts de la communauté
- **visa_applications** - Demandes de visa des utilisateurs

### Comptes créés automatiquement :
- **Admin** : `admin@dora.travel` / `admin123`
- **Utilisateur** : `jean@example.com` / `password123`

## 🔗 Endpoints API

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/verify` - Vérification du token

### Pays
- `GET /api/countries` - Liste des pays
- `GET /api/countries/:code` - Détails d'un pays
- `POST /api/countries` - Créer un pays (admin)
- `PUT /api/countries/:id` - Modifier un pays (admin)
- `DELETE /api/countries/:id` - Supprimer un pays (admin)

### Communauté
- `GET /api/community` - Posts de la communauté
- `GET /api/community/:id` - Détails d'un post
- `POST /api/community` - Créer un post
- `PATCH /api/community/:id/status` - Modérer un post (admin)
- `PATCH /api/community/:id/likes` - Mettre à jour les likes
- `DELETE /api/community/:id` - Supprimer un post

### Utilitaires
- `GET /api/health` - Vérification de l'état du serveur
- `POST /api/init-database` - Réinitialiser la base de données

## 🔒 Sécurité

- **Helmet** - Protection des en-têtes HTTP
- **CORS** - Configuration des origines autorisées
- **Rate Limiting** - Limitation du nombre de requêtes
- **JWT** - Authentification par tokens
- **bcrypt** - Hachage des mots de passe

## 🗄️ Base de données

La base de données PostgreSQL est automatiquement initialisée avec :
- 5 utilisateurs (1 admin + 4 utilisateurs)
- 5 pays avec informations complètes
- 5 hôtels répartis par pays
- 5 restaurants répartis par pays
- 5 sites touristiques répartis par pays
- 5 posts de communauté avec différents statuts

## 📝 Logs

Le serveur affiche des logs détaillés pour :
- ✅ Connexion à la base de données
- ✅ Initialisation des tables
- ✅ Insertion des données
- ✅ Démarrage du serveur
- ❌ Gestion des erreurs

## 🔧 Maintenance

### Réinitialiser la base de données
```bash
npm run init-db
```

### Vérifier l'état du serveur
```bash
curl http://localhost:3001/api/health
```

Le backend est maintenant prêt et fonctionne indépendamment du frontend !