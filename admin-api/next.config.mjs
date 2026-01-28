/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 no longer supports nextConfig.eslint in config
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;