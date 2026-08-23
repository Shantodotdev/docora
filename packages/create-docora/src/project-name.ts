import path from 'node:path'

export function toPackageName(directory: string): string {
  const base = path.basename(path.resolve(directory))

  const name = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[._-]+/, '')
    .replace(/-+$/, '')

  return name || 'my-docs'
}

export function isValidDirectory(input: string): boolean {
  if (!input.trim()) return false
  if (input.includes('\0')) return false
  return true
}
