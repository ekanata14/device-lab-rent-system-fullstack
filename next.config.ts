import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Tambahkan blok rewrites di sini
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://10.127.1.133:3001";

    return [
      {
        // Menangkap semua request yang berawalan /api/ di frontend
        source: "/api/:path*",
        // Meneruskannya ke backend URL yang diatur di .env
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
