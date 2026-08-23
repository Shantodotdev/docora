import { readFile } from 'node:fs/promises'

import type { DocsSource } from '../content/index'
import type { ContentPage } from '../content/types'

export function rawSlug(page: Pick<ContentPage, 'slug'>): string[] {
  if (page.slug.length === 0) return ['index.md']
  return [...page.slug.slice(0, -1), `${page.slug.at(-1)}.md`]
}

export function rawPath(page: Pick<ContentPage, 'slug'>): string {
  return `/raw/${rawSlug(page).join('/')}`
}

export function createRawRoute(source: DocsSource) {
  return {
    dynamic: 'force-static' as const,

    async generateStaticParams() {
      const pages = await source.getPages()

      return pages.map(page => ({ slug: rawSlug(page) }))
    },

    async GET(_request: Request, context: { params: Promise<{ slug: string[] }> }) {
      const { slug } = await context.params
      const last = slug.at(-1)

      if (!last?.endsWith('.md')) return new Response('Not found', { status: 404 })

      const name = last.slice(0, -3)
      const lookup = name === 'index' && slug.length === 1 ? [] : [...slug.slice(0, -1), name]

      const page = await source.getPage(lookup)
      if (!page) return new Response('Not found', { status: 404 })

      return new Response(await readFile(page.filePath, 'utf8'), {
        headers: { 'content-type': 'text/markdown; charset=utf-8' },
      })
    },
  }
}
