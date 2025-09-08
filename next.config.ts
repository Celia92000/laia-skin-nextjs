import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
