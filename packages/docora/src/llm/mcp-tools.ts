import { readFile } from 'node:fs/promises'

import type { DocsConfig } from '../config/types'
import type { DocsSource } from '../content/index'
import { localeFromPath } from '../i18n/paths'
import { buildSearchIndex } from '../search/build'
import { searchDocuments } from '../search/match'

export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: Record<string, unknown>
  handler: (args: Record<string, unknown>) => Promise<unknown>
}

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
}

function pageUrl(config: DocsConfig, path: string): string {
  return config.site.url ? new URL(path, config.site.url).toString() : path
}

export function createMcpTools(source: DocsSource, config: DocsConfig): McpTool[] {
  return [
    {
      name: 'list-pages',
      description: [
        'Lists every documentation page with its title, path and description.',
        '',
        'WHEN TO USE: when exploring what the documentation covers, or when you do',
        'not know the exact path of a page. Start here for open-ended questions.',
        '',
        'WHEN NOT TO USE: if you already know the exact path, call get-page instead.',
        '',
        'WORKFLOW: pick the relevant path from the result, then call get-page for its',
        'full contents.',
      ].join('\n'),
      annotations: READ_ONLY,
      inputSchema: {
        type: 'object',
        properties: {
          locale: {
            type: 'string',
            description: 'Restrict the list to one locale, e.g. "en". Omit for every page.',
          },
        },
        additionalProperties: false,
      },
      async handler({ locale }) {
        const pages = await source.getPages()
        const wanted = typeof locale === 'string' ? locale : undefined

        return {
          pages: pages
            .filter(page => !wanted || localeFromPath(page.path, config.i18n) === wanted)
            .map(page => ({
              title: page.title,
              path: page.path,
              description: page.frontmatter.description ?? '',
              url: pageUrl(config, page.path),
            })),
        }
      },
    },

    {
      name: 'search-docs',
      description: [
        'Searches the documentation for pages matching a query.',
        '',
        'WHEN TO USE: when looking for documentation on a specific topic, feature, or',
        'keyword. Returns ranked matches with short excerpts.',
        '',
        'WHEN NOT TO USE: if you already know the exact path (call get-page) or want',
        'a high-level list of all available pages (call list-pages).',
        '',
        'WORKFLOW: search for relevant pages, pick a matching path from the results,',
        'then call get-page for its full contents.',
      ].join('\n'),
      annotations: READ_ONLY,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Search query or keywords to look for, e.g. "installation" or "navigation".',
          },
          locale: {
            type: 'string',
            description: 'Restrict the search to one locale, e.g. "en". Omit to search all pages.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default 8, maximum 20).',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
      async handler({ query, locale, limit }) {
        if (typeof query !== 'string' || !query.trim()) {
          throw new Error('`query` is required and must be a non-empty string')
        }

        const index = await buildSearchIndex(source, config.i18n)
        const wanted = typeof locale === 'string' ? locale : undefined
        const documents = wanted
          ? index.documents.filter(page => page.locale === wanted)
          : index.documents

        const max =
          typeof limit === 'number' && Number.isFinite(limit)
            ? Math.min(Math.max(Math.floor(limit), 1), 20)
            : 8

        const results = searchDocuments(documents, query, max)

        return {
          results: results.map(result => ({
            title: result.document.title,
            path: result.document.path,
            url: pageUrl(config, result.document.path),
            ...(result.document.section ? { section: result.document.section } : {}),
            ...(result.document.description ? { description: result.document.description } : {}),
            ...(result.heading ? { heading: result.heading.text } : {}),
            ...(result.excerpt ? { excerpt: result.excerpt } : {}),
          })),
        }
      },
    },

    {
      name: 'get-page',
      description: [
        'Retrieves the full markdown of one documentation page.',
        '',
        'WHEN TO USE: when you know the exact path, either from list-pages or given',
        'by the user. Use it before answering questions about specific behaviour, so',
        'the answer comes from the documentation rather than memory.',
        '',
        'WHEN NOT TO USE: if you do not know the path yet — call search-docs or list-pages first.',
      ].join('\n'),
      annotations: READ_ONLY,
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'Exact page path from search-docs or list-pages, e.g. "/docs/getting-started/installation".',
          },
        },
        required: ['path'],
        additionalProperties: false,
      },
      async handler({ path }) {
        if (typeof path !== 'string' || !path) {
          throw new Error('`path` is required and must be a string')
        }

        const normalized = path.startsWith('/') ? path : `/${path}`
        const pages = await source.getPages()
        const page = pages.find(candidate => candidate.path === normalized)

        if (!page) {
          throw new Error(
            `No page at "${normalized}". Call search-docs or list-pages to see the available paths.`,
          )
        }

        return {
          title: page.title,
          path: page.path,
          description: page.frontmatter.description ?? '',
          url: pageUrl(config, page.path),
          content: await readFile(page.filePath, 'utf8'),
        }
      },
    },
  ]
}
