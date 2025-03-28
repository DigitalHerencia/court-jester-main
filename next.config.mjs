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
        hostname: 'a5fvmmg873kgkibm.public.blob.vercel-storage.com',
      },
    ],
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.1.236:3000',
  ],
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

export default nextConfig
