import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: ".next-prod",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
