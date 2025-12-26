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
    const apiUrl = process.env.API_BASE_URL || 'http://13.61.8.92:8080/campustrade';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
