'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useHydrated } from '../hooks/use-hydrated'
import { useMessages } from '../i18n/context'
import { cn } from '../utils/cn'

export function ThemeToggle({ className }: Readonly<{ className?: string }>) {
  const { resolvedTheme, setTheme } = useTheme()
  const messages = useMessages()
  const mounted = useHydrated()

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={
        mounted ? (isDark ? messages.toggleToLight : messages.toggleToDark) : messages.toggleToDark
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-elevated hover:text-highlighted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </button>
  )
}
