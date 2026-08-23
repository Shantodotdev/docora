import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { Icon } from '../components/icon'
import { LinkedBox } from '../components/linked-box'
import { cn } from '../utils/cn'

export type CardProps = Readonly<{
  children?: ReactNode
  title?: string
  icon?: string
  src?: string
  invert?: boolean | string
  to?: string
  target?: string
  className?: string
}>

export function Card({ children, title, icon, src, invert, to, target, className }: CardProps) {
  const external = to?.startsWith('http') ?? false
  const shouldInvert = invert === true || invert === '' || invert === 'true'

  const body = (
    <>
      {src ? (
        <Image
          src={src}
          alt={title || 'Logo'}
          width={32}
          height={32}
          unoptimized={src.startsWith('http') || /\.svg(?:$|\?)/i.test(src)}
          className={cn('mb-3 size-8 shrink-0 object-contain', shouldInvert && 'dark:invert')}
        />
      ) : (
        icon && <Icon name={icon} className="mb-3 size-5 shrink-0 text-primary" />
      )}

      {title && (
        <p className="flex items-center gap-1 font-semibold text-highlighted">
          {title}
          {to && external && <ArrowUpRight className="size-3.5 text-dimmed" aria-hidden />}
        </p>
      )}

      <div className="text-sm text-muted-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </>
  )

  const classes = cn(
    'flex flex-col gap-2 rounded-md border border-border p-4 transition-colors',
    to && 'hover:border-primary/50',
    className,
  )

  return (
    <LinkedBox href={to} target={target} label={title} className={classes}>
      {body}
    </LinkedBox>
  )
}

export type CardGroupProps = Readonly<{
  children?: ReactNode
  cols?: number | string
  className?: string
}>

export function CardGroup({ children, cols = 2, className }: CardGroupProps) {
  const columns = Number(cols) || 2

  return (
    <div
      className={cn(
        'my-5 grid gap-4',
        columns >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
