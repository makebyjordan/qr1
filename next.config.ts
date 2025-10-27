import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: []
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
  // Disable PWA for now to avoid Turbopack conflicts
  // We'll configure it later for production
};

export default nextConfig;
