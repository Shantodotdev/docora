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
  if (url.pathname === current.pathname) return false

  return true
}

type Listener = () => void

const listeners = new Set<Listener>()

export function startRouteProgress(): void {
  for (const listener of listeners) listener()
}

export function onRouteProgressStart(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
