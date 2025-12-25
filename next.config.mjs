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
        destination: '${process.env.API_BASE_URL}/:path*',
      },
    ]
  },
}

export default nextConfig
