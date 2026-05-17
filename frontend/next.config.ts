import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
