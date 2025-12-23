/** @type {import('next').NextConfig} */
const nextConfig = {
  /**reactStrictMode: false, */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://localhost:8080/campustrade/:path*',
      },
    ]
  },
}

export default nextConfig
