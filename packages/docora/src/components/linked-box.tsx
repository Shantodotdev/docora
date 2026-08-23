import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '../utils/cn'

export type LinkedBoxProps = Readonly<{
  href?: string
  target?: string
  label?: string
  className?: string
  children: ReactNode
}>

export function LinkedBox({ href, target, label, className, children }: LinkedBoxProps) {
  if (!href) return <div className={className}>{children}</div>

  const external = href.startsWith('http')
  const openInNewTab = Boolean(target) || external

  return (
    <div className={cn('relative', className)}>
      <Link
        href={href}
        aria-label={label ?? 'Open'}
        className="absolute inset-0 z-0"
        {...(openInNewTab ? { target: target ?? '_blank', rel: 'noreferrer' } : {})}
      />
      <div className="pointer-events-none relative z-10 [&_a]:pointer-events-auto">{children}</div>
    </div>
  )
}
