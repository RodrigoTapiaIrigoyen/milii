/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Cloudinary (fotos de perfiles)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Solo localhost en desarrollo
      { protocol: 'http', hostname: 'localhost' },
      // Unsplash (fotos de seed/demo)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
