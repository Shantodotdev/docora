import type { MetadataRoute } from 'next'

import type { DocsConfig } from '../config/types'
import type { DocsSource } from '../content/index'

export async function createSitemap(
  source: DocsSource,
  config: DocsConfig,
): Promise<MetadataRoute.Sitemap> {
  const pages = await source.getPages()
  const base = config.site.url

  return pages.map(page => ({
    url: base ? new URL(page.path, base).toString() : page.path,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page.path === '/' ? 1 : 0.7,
  }))
}

export function createRobots(config: DocsConfig): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    ...(config.site.url ? { sitemap: new URL('/sitemap.xml', config.site.url).toString() } : {}),
  }
}
