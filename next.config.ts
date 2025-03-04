import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push({
      "pg-native": "commonjs pg-native",
    });
    return config;
  },
};

export default nextConfig;
