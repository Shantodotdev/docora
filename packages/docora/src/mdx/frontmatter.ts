import { parse as parseYaml } from 'yaml'

export interface Frontmatter {
  title?: string
  description?: string
  [key: string]: unknown
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function splitFrontmatter<F extends Frontmatter = Frontmatter>(source: string) {
  const match = source.match(FRONTMATTER_RE)

  if (!match) {
    return { data: {} as F, body: source }
  }

  return {
    data: (parseYaml(match[1] ?? '') ?? {}) as F,
    body: source.slice(match[0].length),
  }
}
