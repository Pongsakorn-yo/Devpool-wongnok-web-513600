import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Catch-all: allow any HTTPS host for remote images (avatars/logos)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'foodish-api.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        pathname: '/public/**',
      },
      // Allow external avatars from Creative Fabrica (e.g., www.creativefabrica.com/wp-content/uploads/...)
      {
        protocol: 'https',
        hostname: '**.creativefabrica.com',
        pathname: '/**',
      },
      // Allow CDN images used in recipe cards
      {
        protocol: 'https',
        hostname: '**.thaicdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's359.thaicdn.net',
        pathname: '/**',
      },
      // Seeklogo image CDN for avatars/logos
      {
        protocol: 'https',
        hostname: 'images.seeklogo.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;