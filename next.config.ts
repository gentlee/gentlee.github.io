import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {unoptimized: true}, // FIX Image Optimization using the default loader is not compatible with `{ output: 'export' }`
}

export default nextConfig
