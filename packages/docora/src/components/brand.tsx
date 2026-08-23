'use client'

import Image from 'next/image'

import { useDocsConfig } from '../config/context'
import { cn } from '../utils/cn'

export type BrandMarkProps = Readonly<{
  priority?: boolean
  className?: string
}>

export function BrandMark({ priority, className }: BrandMarkProps) {
  const config = useDocsConfig()
  const logo = config.header?.logo
  const title = config.header?.title ?? config.site.name

  if (!logo?.light && !logo?.dark) return null

  return (
    <>
      {logo.light && (
        <Image
          src={logo.light}
          alt={logo.alt || title}
          width={24}
          height={24}
          priority={priority}
          unoptimized={/\.svg(?:$|\?)/i.test(logo.light)}
          className={cn('h-6 w-auto', logo.dark && 'dark:hidden', logo.className, className)}
        />
      )}
      {logo.dark && (
        <Image
          src={logo.dark}
          alt={logo.alt || title}
          width={24}
          height={24}
          priority={priority}
          unoptimized={/\.svg(?:$|\?)/i.test(logo.dark)}
          className={cn('hidden h-6 w-auto dark:block', logo.className, className)}
        />
      )}
    </>
  )
}
