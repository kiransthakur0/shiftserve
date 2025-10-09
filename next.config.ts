import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ensure ESLint runs during production build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ensure TypeScript checks during production build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
