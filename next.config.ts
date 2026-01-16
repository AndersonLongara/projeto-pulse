import type { NextConfig } from "next";
// import withPWAInit from "next-pwa";

// PWA temporarily disabled until next-pwa supports Turbopack
// const withPWA = withPWAInit({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   skipWaiting: true,
// });

const nextConfig: NextConfig = {
  // React strict mode for better development experience
  reactStrictMode: true,

  // Turbopack configuration (required for Next.js 16+)
  turbopack: {},

  // Experimental features for Next.js 15+
  experimental: {
    // Enable server actions (default in Next 15, but explicit for clarity)
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Headers (additional to middleware for static assets)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

