import { readFile } from 'node:fs/promises'

import type { DocsSource } from '../content/index'
import type { ContentPage } from '../content/types'
import { splitFrontmatter } from '../mdx/frontmatter'
import { normalizeMdcToMarkdown } from './mdc'

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

      const raw = await readFile(page.filePath, 'utf8')
      const { body } = splitFrontmatter(raw)
      const normalized = normalizeMdcToMarkdown(body)

      const lines: string[] = []
      if (page.title && !normalized.startsWith('# ')) lines.push(`# ${page.title}`, '')
      if (page.frontmatter.description) lines.push(`> ${page.frontmatter.description}`, '')
      lines.push(normalized, '')

      return new Response(lines.join('\n'), {
        headers: { 'content-type': 'text/markdown; charset=utf-8' },
      })
    },
  }
}
