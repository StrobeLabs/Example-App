/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    domains: ['firebasestorage.googleapis.com'],
  },
    webpack: (config) => {
      config.externals.push('pino-pretty', 'encoding');
      return config;
    },
};

export default nextConfig;
