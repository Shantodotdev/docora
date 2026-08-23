import type { NextConfig } from 'next'
import { withDocora } from 'docora/next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/en', permanent: false }]
  },
}

export default withDocora(nextConfig)
