import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Initialisation de la base de données...');

    // Supprimer les tables existantes (dans l'ordre inverse des dépendances)
    await client.query('DROP TABLE IF EXISTS visa_applications CASCADE');
    await client.query('DROP TABLE IF EXISTS community_posts CASCADE');
    await client.query('DROP TABLE IF EXISTS tourist_sites CASCADE');
    await client.query('DROP TABLE IF EXISTS restaurants CASCADE');
    await client.query('DROP TABLE IF EXISTS hotels CASCADE');
    await client.query('DROP TABLE IF EXISTS countries CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    console.log('🗑️ Tables existantes supprimées');

    // Créer la table users
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        avatar TEXT,
        joined_date DATE DEFAULT CURRENT_DATE,
        preferences JSONB DEFAULT '{"language": "fr", "currency": "EUR"}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table countries
    await client.query(`
      CREATE TABLE countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(3) UNIQUE NOT NULL,
        flag VARCHAR(10) NOT NULL,
        continent VARCHAR(100) NOT NULL,
        capital VARCHAR(255) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        language VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        visa_required BOOLEAN DEFAULT false,
        processing_time VARCHAR(100),
        average_cost INTEGER DEFAULT 0,
        popular_season VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table hotels
    await client.query(`
      CREATE TABLE hotels (
        id SERIAL PRIMARY KEY,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        image TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        amenities JSONB DEFAULT '[]',
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table restaurants
    await client.query(`
      CREATE TABLE restaurants (
        id SERIAL PRIMARY KEY,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        cuisine VARCHAR(100) NOT NULL,
        price_range VARCHAR(20) NOT NULL,
        rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
        image TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        average_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table tourist_sites
    await client.query(`
      CREATE TABLE tourist_sites (
        id SERIAL PRIMARY KEY,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        visit_duration VARCHAR(100) NOT NULL,
        best_time VARCHAR(100) NOT NULL,
        entry_fee DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table community_posts
    await client.query(`
      CREATE TABLE community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        image TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        tags JSONB DEFAULT '[]',
        likes INTEGER DEFAULT 0,
        dislikes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table visa_applications
    await client.query(`
      CREATE TABLE visa_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        current_step INTEGER DEFAULT 1,
        completed_steps JSONB DEFAULT '[]',
        form_data JSONB DEFAULT '{}',
        documents JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables créées avec succès');

    // Insérer les utilisateurs
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Admin DORA',
        email: 'admin@dora.travel',
        password: hashedAdminPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        password: hashedUserPassword,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Marie Martin',
        email: 'marie@example.com',
        password: hashedUserPassword,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Pierre Durand',
        email: 'pierre@example.com',
        password: hashedUserPassword,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Fatou Diallo',
        email: 'fatou@example.com',
        password: hashedUserPassword,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
      }
    ];

    for (const user of users) {
      await client.query(
        'INSERT INTO users (name, email, password, role, avatar) VALUES ($1, $2, $3, $4, $5)',
        [user.name, user.email, user.password, user.role, user.avatar]
      );
    }

    console.log('✅ Utilisateurs créés');

    // Insérer les pays
    const countries = [
      {
        name: 'Canada', code: 'CA', flag: '🇨🇦', continent: 'Amérique du Nord',
        capital: 'Ottawa', currency: 'CAD', language: 'Français/Anglais',
        image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=300&fit=crop',
        description: 'Le Canada offre des paysages magnifiques et une qualité de vie exceptionnelle.',
        visa_required: true, processing_time: '15-30 jours', average_cost: 150, popular_season: 'Été'
      },
      {
        name: 'France', code: 'FR', flag: '🇫🇷', continent: 'Europe',
        capital: 'Paris', currency: 'EUR', language: 'Français',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
        description: 'La France, pays de l\'art, de la culture et de la gastronomie.',
        visa_required: false, processing_time: 'N/A', average_cost: 0, popular_season: 'Printemps/Été'
      },
      {
        name: 'Japon', code: 'JP', flag: '🇯🇵', continent: 'Asie',
        capital: 'Tokyo', currency: 'JPY', language: 'Japonais',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        description: 'Le Japon mélange harmonieusement tradition et modernité.',
        visa_required: true, processing_time: '5-10 jours', average_cost: 100, popular_season: 'Printemps/Automne'
      },
      {
        name: 'États-Unis', code: 'US', flag: '🇺🇸', continent: 'Amérique du Nord',
        capital: 'Washington D.C.', currency: 'USD', language: 'Anglais',
        image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&h=300&fit=crop',
        description: 'Les États-Unis offrent une diversité culturelle et géographique unique.',
        visa_required: true, processing_time: '10-15 jours', average_cost: 160, popular_season: 'Toute l\'année'
      },
      {
        name: 'Sénégal', code: 'SN', flag: '🇸🇳', continent: 'Afrique',
        capital: 'Dakar', currency: 'XAF', language: 'Français',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        description: 'Le Sénégal, terre de la Teranga et de richesses culturelles.',
        visa_required: false, processing_time: 'N/A', average_cost: 0, popular_season: 'Saison sèche'
      }
    ];

    for (const country of countries) {
      await client.query(
        `INSERT INTO countries (name, code, flag, continent, capital, currency, language, image, description, visa_required, processing_time, average_cost, popular_season) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [country.name, country.code, country.flag, country.continent, country.capital, country.currency, country.language, country.image, country.description, country.visa_required, country.processing_time, country.average_cost, country.popular_season]
      );
    }

    console.log('✅ Pays créés');

    // Insérer les hôtels
    const hotels = [
      {
        country_id: 1, name: 'Fairmont Chateau Lake Louise', price: 450, currency: 'CAD', rating: 5,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        location: 'Lake Louise, Alberta', amenities: '["WiFi", "Spa", "Restaurant", "Ski"]',
        description: 'Hôtel de luxe avec vue sur le lac Louise et les montagnes Rocheuses'
      },
      {
        country_id: 1, name: 'Hotel Le Germain Toronto', price: 280, currency: 'CAD', rating: 4,
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        location: 'Toronto, Ontario', amenities: '["WiFi", "Fitness", "Restaurant", "Bar"]',
        description: 'Hôtel boutique moderne au cœur de Toronto'
      },
      {
        country_id: 2, name: 'Hotel Plaza Athénée', price: 800, currency: 'EUR', rating: 5,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
        location: 'Paris 8ème', amenities: '["WiFi", "Spa", "Restaurant", "Concierge"]',
        description: 'Palace parisien sur l\'avenue Montaigne'
      },
      {
        country_id: 3, name: 'Park Hyatt Tokyo', price: 45000, currency: 'JPY', rating: 5,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        location: 'Shinjuku, Tokyo', amenities: '["WiFi", "Spa", "Restaurant", "Fitness"]',
        description: 'Hôtel de luxe avec vue panoramique sur Tokyo'
      },
      {
        country_id: 4, name: 'The Plaza Hotel', price: 695, currency: 'USD', rating: 5,
        image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=300&fit=crop',
        location: 'New York, NY', amenities: '["WiFi", "Spa", "Restaurant", "Concierge"]',
        description: 'Hôtel légendaire face à Central Park'
      }
    ];

    for (const hotel of hotels) {
      await client.query(
        `INSERT INTO hotels (country_id, name, price, currency, rating, image, location, amenities, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [hotel.country_id, hotel.name, hotel.price, hotel.currency, hotel.rating, hotel.image, hotel.location, hotel.amenities, hotel.description]
      );
    }

    console.log('✅ Hôtels créés');

    // Insérer les restaurants
    const restaurants = [
      {
        country_id: 1, name: 'Toqué!', cuisine: 'Française contemporaine', price_range: '€€€€', rating: 4.8,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        location: 'Montréal, Québec', average_price: 120, currency: 'CAD',
        description: 'Restaurant gastronomique réputé pour sa cuisine créative'
      },
      {
        country_id: 2, name: 'L\'Ambroisie', cuisine: 'Française', price_range: '€€€€', rating: 4.9,
        image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&h=300&fit=crop',
        location: 'Paris 4ème', average_price: 350, currency: 'EUR',
        description: 'Restaurant trois étoiles Michelin sur la place des Vosges'
      },
      {
        country_id: 3, name: 'Sukiyabashi Jiro', cuisine: 'Sushi', price_range: '€€€€', rating: 4.7,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        location: 'Tokyo, Japon', average_price: 35000, currency: 'JPY',
        description: 'Restaurant de sushi légendaire du maître Jiro Ono'
      },
      {
        country_id: 4, name: 'Eleven Madison Park', cuisine: 'Américaine moderne', price_range: '€€€€', rating: 4.6,
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
        location: 'New York, NY', average_price: 335, currency: 'USD',
        description: 'Restaurant végétalien trois étoiles Michelin'
      },
      {
        country_id: 5, name: 'La Calebasse', cuisine: 'Sénégalaise', price_range: '€€', rating: 4.5,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        location: 'Dakar, Sénégal', average_price: 25, currency: 'XAF',
        description: 'Restaurant traditionnel sénégalais authentique'
      }
    ];

    for (const restaurant of restaurants) {
      await client.query(
        `INSERT INTO restaurants (country_id, name, cuisine, price_range, rating, image, location, average_price, currency, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [restaurant.country_id, restaurant.name, restaurant.cuisine, restaurant.price_range, restaurant.rating, restaurant.image, restaurant.location, restaurant.average_price, restaurant.currency, restaurant.description]
      );
    }

    console.log('✅ Restaurants créés');

    // Insérer les sites touristiques
    const touristSites = [
      {
        country_id: 1, name: 'Chutes du Niagara', category: 'Nature',
        image: 'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=400&h=300&fit=crop',
        location: 'Ontario/New York', description: 'Spectaculaires chutes d\'eau à la frontière Canada-États-Unis',
        visit_duration: '1-2 jours', best_time: 'Mai-Octobre', entry_fee: 0, currency: 'CAD'
      },
      {
        country_id: 2, name: 'Tour Eiffel', category: 'Monument',
        image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&h=300&fit=crop',
        location: 'Paris', description: 'Symbole emblématique de Paris et de la France',
        visit_duration: '2-3 heures', best_time: 'Toute l\'année', entry_fee: 29, currency: 'EUR'
      },
      {
        country_id: 3, name: 'Mont Fuji', category: 'Nature',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        location: 'Honshu', description: 'Montagne sacrée et symbole du Japon',
        visit_duration: '1-2 jours', best_time: 'Mai-Septembre', entry_fee: 1000, currency: 'JPY'
      },
      {
        country_id: 4, name: 'Statue de la Liberté', category: 'Monument',
        image: 'https://images.unsplash.com/photo-1526472129813-f17ef06064a5?w=400&h=300&fit=crop',
        location: 'New York', description: 'Symbole de la liberté et de l\'amitié franco-américaine',
        visit_duration: '3-4 heures', best_time: 'Avril-Octobre', entry_fee: 21, currency: 'USD'
      },
      {
        country_id: 5, name: 'Île de Gorée', category: 'Histoire',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        location: 'Dakar', description: 'Île historique symbole de la traite négrière',
        visit_duration: '1 jour', best_time: 'Octobre-Mai', entry_fee: 5, currency: 'XAF'
      }
    ];

    for (const site of touristSites) {
      await client.query(
        `INSERT INTO tourist_sites (country_id, name, category, image, location, description, visit_duration, best_time, entry_fee, currency) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [site.country_id, site.name, site.category, site.image, site.location, site.description, site.visit_duration, site.best_time, site.entry_fee, site.currency]
      );
    }

    console.log('✅ Sites touristiques créés');

    // Insérer les posts de la communauté
    const communityPosts = [
      {
        user_id: 2, country_id: 1, title: 'Mon expérience visa Canada - Tout s\'est bien passé !',
        content: 'Salut tout le monde ! Je voulais partager mon expérience récente avec la demande de visa pour le Canada...',
        image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400&h=300&fit=crop',
        status: 'approved', rating: 4, tags: '["visa", "canada", "expérience", "conseils"]',
        likes: 24, dislikes: 2, comments: 8, views: 156
      },
      {
        user_id: 3, country_id: 3, title: 'Voyage au Japon - Conseils pratiques et bons plans',
        content: 'Le Japon est un pays absolument fascinant ! Après 2 semaines sur place...',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        status: 'approved', rating: 5, tags: '["japon", "voyage", "conseils", "culture"]',
        likes: 42, dislikes: 1, comments: 15, views: 289
      },
      {
        user_id: 4, country_id: 4, title: 'Demande de visa USA - Quelques difficultés rencontrées',
        content: 'Bonjour la communauté ! Je partage mon expérience avec la demande de visa pour les États-Unis...',
        image: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&h=300&fit=crop',
        status: 'approved', rating: 3, tags: '["usa", "visa", "difficultés", "conseils"]',
        likes: 18, dislikes: 3, comments: 12, views: 134
      },
      {
        user_id: 5, country_id: 2, title: 'Paris en famille - Guide complet',
        content: 'Paris avec des enfants, c\'est possible ! Voici notre guide complet...',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
        status: 'pending', rating: 4, tags: '["paris", "famille", "enfants", "guide"]',
        likes: 0, dislikes: 0, comments: 0, views: 0
      },
      {
        user_id: 2, country_id: 5, title: 'Découverte du Sénégal - Culture et traditions',
        content: 'Mon voyage au Sénégal a été une révélation culturelle...',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        status: 'approved', rating: 5, tags: '["sénégal", "culture", "traditions", "voyage"]',
        likes: 31, dislikes: 0, comments: 9, views: 203
      }
    ];

    for (const post of communityPosts) {
      await client.query(
        `INSERT INTO community_posts (user_id, country_id, title, content, image, status, rating, tags, likes, dislikes, comments, views) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [post.user_id, post.country_id, post.title, post.content, post.image, post.status, post.rating, post.tags, post.likes, post.dislikes, post.comments, post.views]
      );
    }

    console.log('✅ Posts de la communauté créés');

    // Créer des index pour améliorer les performances
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_community_posts_country_id ON community_posts(country_id)');

    console.log('✅ Index créés');

    console.log('🎉 Base de données initialisée avec succès !');
    console.log('👤 Admin créé: admin@dora.travel / admin123');
    console.log('👤 Utilisateur créé: jean@example.com / password123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Exécuter l'initialisation si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log('✅ Initialisation terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default initDatabase;