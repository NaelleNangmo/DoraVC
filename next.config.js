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
  swcMinify: false,
  experimental: {
    esmExternals: false,
    serverComponentsExternalPackages: [],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Désactiver SWC et utiliser Babel à la place
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });

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