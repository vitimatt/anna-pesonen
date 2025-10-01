import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  transpilePackages: ['next-sanity', '@sanity/vision'],
  experimental: {
    taint: true,
  },
};

export default nextConfig;
