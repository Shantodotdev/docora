import type { DocsSource } from '../content/index'
import type { I18nConfig } from '../i18n/types'
import { buildSearchIndex } from './build'

export function createSearchRoute(source: DocsSource, i18n?: I18nConfig) {
  return {
    dynamic: 'force-static' as const,
    async GET() {
      const index = await buildSearchIndex(source, i18n)

      return Response.json(index, {
        headers: { 'cache-control': 'public, max-age=0, must-revalidate' },
      })
    },
  }
}
