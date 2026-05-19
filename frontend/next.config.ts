import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    'axios', 'form-data', 'sharp', 'crypto', 'path', 'fs', 'url',
    'querystring', 'buffer', 'stream', 'util', 'zlib',
    'node-fetch', 'cheerio', 'lodash', 'moment', 'dayjs',
    'uuid', 'validator', 'sanitize-html', 'marked', 'csv-parse',
    'qrcode', 'jimp', 'pdf-lib', 'qs', 'dateformat',
    '@google/generative-ai', 'https-proxy-agent'
  ],
  // Force-include all node_modules used by the code executor sandbox
  // Vercel NFT can't trace dynamic child_process require() calls,
  // so we explicitly include the full dependency trees
  outputFileTracingIncludes: {
    '/api/sandbox': ['./node_modules/**'],
    '/api/execute': ['./node_modules/**'],
  },
  /* config options here */
  allowedDevOrigins: ['192.168.101.8'],
  
  // Turbopack config (required for Next.js 16+)
  turbopack: {
    // Empty config to silence warning
    // Turbopack doesn't need webpack ignoreWarnings
  },
  
  // Suppress THREE.Clock deprecation warning (webpack only)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /node_modules\/three/,
          message: /THREE\.Clock/,
        },
      ];
    }
    
    // Remove console.logs in production
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...((config.optimization?.minimizer as any[]) || []),
        ],
      };
    }
    
    return config;
  },
};

export default nextConfig;
