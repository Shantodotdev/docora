export function toSearchableText(markdown: string): string {
  return markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s*:{2,}[a-z0-9-]*\{?[^}\n]*\}?\s*$/gim, ' ')
    .replace(/:[a-z][a-z0-9-]*\{[^}]*\}/gi, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\{[^}]*\}/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^[>\-*+]\s+/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractHeadings(markdown: string): { text: string; depth: number }[] {
  const body = markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    .replace(/```[\s\S]*?```/g, '')

  return [...body.matchAll(/^(#{2,4})\s+(.+)$/gm)].map(match => ({
    depth: match[1]!.length,
    text: match[2]!.replace(/[*_`]/g, '').trim(),
  }))
}
