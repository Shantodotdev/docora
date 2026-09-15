import { stat } from 'node:fs/promises'
import type { MetadataRoute } from 'next'

import type { DocsConfig } from '../config/types'
import type { DocsSource } from '../content/index'

function toUrl(base: string | undefined, path: string): string {
  return base ? new URL(path, base).toString() : path
}

export async function createSitemap(
  source: DocsSource,
  config: DocsConfig,
): Promise<MetadataRoute.Sitemap> {
  const pages = await source.getPages()
  const base = config.site.url

  return Promise.all(
    pages.map(async page => {
      let lastModified: Date | undefined

      // Prefer explicit frontmatter date if provided
      const frontmatterDate =
        page.frontmatter.lastmod ?? page.frontmatter.lastModified ?? page.frontmatter.date
      if (frontmatterDate) {
        const parsed = new Date(frontmatterDate as string | number | Date)
        if (!isNaN(parsed.getTime())) lastModified = parsed
      }

      // Fall back to the file's actual modification time on disk
      if (!lastModified && page.filePath) {
        try {
          const fileStat = await stat(page.filePath)
          lastModified = fileStat.mtime
        } catch {
          // Leave undefined if file cannot be accessed on disk
        }
      }

      // Build hreflang language alternates for i18n setups
      const alternates = await source.getAlternates(page.path)
      const languages: Record<string, string> = {}
      for (const [locale, altPath] of Object.entries(alternates)) {
        languages[locale] = toUrl(base, altPath)
      }

      // Point x-default to the default locale variant
      const defaultLocale = config.i18n?.defaultLocale
      const defaultPath = defaultLocale ? alternates[defaultLocale] : undefined
      if (defaultPath) {
        languages['x-default'] = toUrl(base, defaultPath)
      }
      const hasLanguages = Object.keys(languages).length > 0

      return {
        url: toUrl(base, page.path),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'weekly' as const,
        priority: page.path === '/' ? 1 : 0.7,
        ...(hasLanguages ? { alternates: { languages } } : {}),
      }
    }),
  )
}

export function createRobots(config: DocsConfig): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    ...(config.site.url ? { sitemap: new URL('/sitemap.xml', config.site.url).toString() } : {}),
  }
}
