/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@salary-advance/lib', '@salary-advance/types'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
