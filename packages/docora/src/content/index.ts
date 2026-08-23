import path from 'node:path'

import type { NavItem } from '../config/types'
import type { I18nConfig } from '../i18n/types'
import { localeFromPath, pathForLocale } from '../i18n/paths'
import { buildNavigation, findSection, findSurround } from './navigation'
import { parseOrderPrefix } from './slug'
import { findDirectory, flattenPages, readContentTree, type ContentDirectory } from './tree'
import type { ContentPage, PageSurround } from './types'

export interface DocsSourceOptions {
  contentDir: string
  navigationRoot?: string
  i18n?: I18nConfig
}

export interface DocsSource {
  getPage(slug?: string[]): Promise<ContentPage | undefined>
  getPages(): Promise<ContentPage[]>
  getNavigation(locale?: string): Promise<NavItem[]>
  getSurround(path: string): Promise<PageSurround>
  getSection(path: string): Promise<string | undefined>
  getStaticParams(): Promise<{ slug: string[] }[]>
  getAlternates(path: string): Promise<Record<string, string>>
}

export function createDocsSource({
  contentDir,
  navigationRoot,
  i18n,
}: DocsSourceOptions): DocsSource {
  let cached: Promise<ContentDirectory> | undefined

  function tree(): Promise<ContentDirectory> {
    if (process.env.NODE_ENV === 'development') return readContentTree(contentDir)

    cached ??= readContentTree(contentDir)
    return cached
  }

  function navigationDirectory(root: ContentDirectory, locale?: string): ContentDirectory {
    let base = root

    if (i18n) {
      const code = locale ?? i18n.defaultLocale
      base = findDirectory(root, [code]) ?? root
    }

    if (navigationRoot) {
      return findDirectory(base, navigationRoot.split('/').filter(Boolean)) ?? base
    }

    return base.directories.find(child => child.name === 'docs') ?? base
  }

  async function getNavigation(locale?: string): Promise<NavItem[]> {
    return buildNavigation(navigationDirectory(await tree(), locale))
  }

  async function getPages(): Promise<ContentPage[]> {
    return flattenPages(await tree())
  }

  return {
    getPages,
    getNavigation,

    async getPage(slug = []) {
      const wanted = slug.map(segment => parseOrderPrefix(segment).name).join('/')
      return (await getPages()).find(page => page.slug.join('/') === wanted)
    },

    async getSurround(currentPath) {
      // Pager stays inside the locale the reader is already in.
      return findSurround(await getNavigation(localeFromPath(currentPath, i18n)), currentPath)
    },

    async getSection(currentPath) {
      return findSection(await getNavigation(localeFromPath(currentPath, i18n)), currentPath)
    },

    async getAlternates(currentPath) {
      if (!i18n) return {}

      const pages = await getPages()
      const alternates: Record<string, string> = {}

      for (const locale of i18n.locales) {
        const candidate = pathForLocale(currentPath, locale.code, i18n)
        if (pages.some(page => page.path === candidate)) alternates[locale.code] = candidate
      }

      return alternates
    },

    async getStaticParams() {
      return (await getPages()).map(page => ({ slug: page.slug }))
    },
  }
}

export function defaultContentDir(): string {
  return path.join(process.cwd(), 'content')
}

export {
  buildNavigation,
  findSection,
  findSurround,
  flattenNavigation,
  sectionsByPath,
} from './navigation'
export { readContentTree, flattenPages, findDirectory, type ContentDirectory } from './tree'
export { humanize, parseOrderPrefix, slugToPath, stripExtension } from './slug'
export type { ContentPage, DirectoryMeta, PageFrontmatter, PageSurround } from './types'
