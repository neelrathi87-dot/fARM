/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double initialization issues with Leaflet map tiles
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
