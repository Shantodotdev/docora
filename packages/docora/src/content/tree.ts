import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { parse as parseYaml } from 'yaml'

import { splitFrontmatter } from '../mdx/frontmatter'
import { humanize, parseOrderPrefix, slugToPath, stripExtension } from './slug'
import type { ContentPage, DirectoryMeta, PageFrontmatter } from './types'

const PAGE_EXTENSIONS = ['.md', '.mdx']
const DIRECTORY_META_FILE = '.navigation.yml'

export interface ContentDirectory {
  name: string
  slug: string[]
  order: number
  meta: DirectoryMeta
  index?: ContentPage
  pages: ContentPage[]
  directories: ContentDirectory[]
}

async function readDirectoryMeta(dir: string): Promise<DirectoryMeta> {
  try {
    const raw = await readFile(path.join(dir, DIRECTORY_META_FILE), 'utf8')
    return (parseYaml(raw) ?? {}) as DirectoryMeta
  } catch {
    return {}
  }
}

async function readPage(
  contentDir: string,
  filePath: string,
  slug: string[],
  order: number,
): Promise<ContentPage> {
  const source = await readFile(filePath, 'utf8')
  const { data } = splitFrontmatter<PageFrontmatter>(source)
  const fallback = slug.at(-1)

  return {
    slug,
    path: slugToPath(slug),
    filePath,
    relativePath: path.relative(contentDir, filePath).split(path.sep).join('/'),
    frontmatter: data,
    order,
    title: data.title ?? (fallback ? humanize(fallback) : 'Home'),
  }
}

export async function readContentTree(
  contentDir: string,
  relativeSlug: string[] = [],
): Promise<ContentDirectory> {
  const dir = path.join(contentDir, ...relativeSlug)
  const entries = await readdir(dir, { withFileTypes: true })

  const directory: ContentDirectory = {
    name: relativeSlug.at(-1) ?? '',
    slug: relativeSlug,
    order: Number.MAX_SAFE_INTEGER,
    meta: await readDirectoryMeta(dir),
    pages: [],
    directories: [],
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    if (entry.isDirectory()) {
      const { name, order } = parseOrderPrefix(entry.name)
      const child = await readContentTree(contentDir, [...relativeSlug, entry.name])

      child.name = name
      child.order = order
      child.slug = [...relativeSlug.map(segment => parseOrderPrefix(segment).name), name]
      directory.directories.push(child)
      continue
    }

    if (!PAGE_EXTENSIONS.includes(path.extname(entry.name))) continue

    const { name, order } = parseOrderPrefix(stripExtension(entry.name))
    const parentSlug = relativeSlug.map(segment => parseOrderPrefix(segment).name)
    const filePath = path.join(dir, entry.name)

    if (name === 'index') {
      directory.index = await readPage(contentDir, filePath, parentSlug, order)
      continue
    }

    directory.pages.push(await readPage(contentDir, filePath, [...parentSlug, name], order))
  }

  const byOrder = <T extends { order: number; name?: string }>(a: T, b: T) =>
    a.order - b.order || (a.name ?? '').localeCompare(b.name ?? '')

  directory.pages.sort(
    (a, b) => a.order - b.order || a.slug.join('/').localeCompare(b.slug.join('/')),
  )
  directory.directories.sort(byOrder)

  return directory
}

export function flattenPages(directory: ContentDirectory): ContentPage[] {
  const pages: ContentPage[] = []

  if (directory.index) pages.push(directory.index)
  pages.push(...directory.pages)

  for (const child of directory.directories) {
    pages.push(...flattenPages(child))
  }

  return pages
}

export function findDirectory(
  directory: ContentDirectory,
  slug: string[],
): ContentDirectory | undefined {
  if (slug.length === 0) return directory

  const [head, ...rest] = slug
  const child = directory.directories.find(candidate => candidate.name === head)

  return child ? findDirectory(child, rest) : undefined
}
