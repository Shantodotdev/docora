export function parseOrderPrefix(name: string): { name: string; order: number } {
  const match = name.match(/^(\d+)\.(.+)$/)

  if (!match) return { name, order: Number.MAX_SAFE_INTEGER }

  return { name: match[2]!, order: Number(match[1]) }
}

export function stripExtension(fileName: string): string {
  return fileName.replace(/\.mdx?$/, '')
}

export function humanize(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function slugToPath(slug: string[]): string {
  return slug.length === 0 ? '/' : `/${slug.join('/')}`
}
