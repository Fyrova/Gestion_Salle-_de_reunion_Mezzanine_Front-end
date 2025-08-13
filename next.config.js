/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ]
  },
  images: {
    domains: ['localhost', 'backend'],
  },
  env: {
    API_URL: process.env.BACKEND_URL || 'http://localhost:8080',
  },
  // Disable font optimization to prevent Google Fonts fetching
  optimizeFonts: false,
}

module.exports = nextConfig
