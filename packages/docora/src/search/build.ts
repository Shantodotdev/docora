import { readFile } from 'node:fs/promises'

import type { DocsSource } from '../content/index'
import { sectionsByPath } from '../content/navigation'
import type { I18nConfig } from '../i18n/types'
import { localeFromPath } from '../i18n/paths'
import { extractHeadings, toSearchableText } from './text'
import type { SearchDocument, SearchIndex } from './types'

const MAX_CONTENT_LENGTH = 8000

export async function buildSearchIndex(
  source: DocsSource,
  i18n?: I18nConfig,
): Promise<SearchIndex> {
  const pages = await source.getPages()

  const navigations = i18n
    ? await Promise.all(i18n.locales.map(locale => source.getNavigation(locale.code)))
    : [await source.getNavigation()]

  const sections = new Map<string, string>()
  for (const navigation of navigations) sectionsByPath(navigation, undefined, sections)

  const documents = await Promise.all(
    pages.map(async (page): Promise<SearchDocument> => {
      const raw = await readFile(page.filePath, 'utf8')
      const section = sections.get(page.path)
      const locale = localeFromPath(page.path, i18n)

      return {
        path: page.path,
        title: page.title,
        ...(page.frontmatter.description ? { description: page.frontmatter.description } : {}),
        ...(section ? { section } : {}),
        ...(locale ? { locale } : {}),
        headings: extractHeadings(raw),
        content: toSearchableText(raw).slice(0, MAX_CONTENT_LENGTH),
      }
    }),
  )

  return { documents }
}
