/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'dpdmrnnwvipljecsrovg.supabase.co',
      }
    ],
    // Optimize image loading
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  // Optimize bundling and caching
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
        // Separate map components
        mapbox: {
          test: /[\\/]node_modules[\\/](mapbox|maplibre)[/]/,
          name: 'mapbox',
          chunks: 'async',
          priority: 10,
        },
        // Separate framer motion
        animations: {
          test: /[\\/]node_modules[\\/]framer-motion[/]/,
          name: 'animations',
          chunks: 'async',
          priority: 10,
        },
      },
    };
    return config;
  },
  // Enable React compiler for better memoization
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
