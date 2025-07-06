/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true 
  },
  trailingSlash: true,
  // Désactiver SWC complètement pour éviter les erreurs sur Windows
  swcMinify: false,
  experimental: {
    esmExternals: false,
    serverComponentsExternalPackages: [],
    // Désactiver SWC
    forceSwcTransforms: false,
  },
  // Configuration webpack pour Windows
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configuration spécifique pour Windows
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    // Fallbacks pour les modules Node.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Optimisations pour la compatibilité
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };

    // Configuration pour éviter les erreurs de cache
    config.cache = false;

    return config;
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig;