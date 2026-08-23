export interface NavigationClick {
  defaultPrevented: boolean
  button: number
  modified: boolean
  href: string | null
  resolvedHref: string
  target: string
  download: boolean
  currentUrl: string
}

export function startsNavigation(click: NavigationClick): boolean {
  if (click.defaultPrevented || click.button !== 0 || click.modified) return false
  if (!click.href || click.download || click.target === '_blank') return false

  let url: URL
  let current: URL

  try {
    url = new URL(click.resolvedHref, click.currentUrl)
    current = new URL(click.currentUrl)
  } catch {
    return false
  }

  if (url.origin !== current.origin) return false
  // Same-document jumps (hash links, query-only changes) never change the path.
  if (url.pathname === current.pathname) return false

  return true
}

type Listener = () => void

const listeners = new Set<Listener>()

/**
 * Starts the loading indicator for a navigation no anchor click produces —
 * `router.push` from the search palette, the language switcher, or app code.
 * A no-op when the indicator is disabled.
 */
export function startRouteProgress(): void {
  for (const listener of listeners) listener()
}

export function onRouteProgressStart(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
