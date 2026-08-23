'use client'

import { Pencil, TriangleAlert } from 'lucide-react'
import Link from 'next/link'

import { useDocsConfig } from '../config/context'
import type { DocsConfig } from '../config/types'
import { cn } from '../utils/cn'

export function createEditUrl(config: DocsConfig, relativePath: string): string | undefined {
  const repository = config.github?.url
  if (!repository) return undefined

  const branch = config.github?.branch ?? 'main'
  const rootDir = config.github?.rootDir?.replace(/^\/+|\/+$/g, '')
  const segments = [rootDir, 'content', relativePath].filter(Boolean).join('/')

  return `${repository.replace(/\/+$/, '')}/edit/${branch}/${segments}`
}

export function createIssueUrl(config: DocsConfig, title: string): string | undefined {
  const repository = config.github?.url
  if (!repository) return undefined

  const params = new URLSearchParams({ title: `Docs: ${title}` })
  return `${repository.replace(/\/+$/, '')}/issues/new?${params.toString()}`
}

export type PageLinksProps = Readonly<{
  relativePath?: string
  title?: string
  className?: string
}>

export function PageLinks({ relativePath, title, className }: PageLinksProps) {
  const config = useDocsConfig()

  const editUrl = relativePath ? createEditUrl(config, relativePath) : undefined
  const issueUrl = title ? createIssueUrl(config, title) : undefined

  if (!editUrl && !issueUrl) return null

  const linkClass =
    'flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-highlighted'

  return (
    <ul className={cn('space-y-2', className)}>
      {editUrl && (
        <li>
          <Link href={editUrl} target="_blank" rel="noreferrer" className={linkClass}>
            <Pencil className="size-4 shrink-0" aria-hidden />
            Edit this page
          </Link>
        </li>
      )}

      {issueUrl && (
        <li>
          <Link href={issueUrl} target="_blank" rel="noreferrer" className={linkClass}>
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            Report an issue
          </Link>
        </li>
      )}
    </ul>
  )
}
