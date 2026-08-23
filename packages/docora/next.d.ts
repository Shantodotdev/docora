import type { NextConfig } from 'next'

export interface DocoraConfig extends NextConfig {
  contentDir?: string
}

export declare function withDocora(nextConfig?: DocoraConfig): NextConfig
export default withDocora
