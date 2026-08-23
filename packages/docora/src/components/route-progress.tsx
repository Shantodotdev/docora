'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { cn } from '../utils/cn'
import { onRouteProgressStart, startsNavigation } from './route-progress-target'

const DURATION = 2000
const THROTTLE = 200
const HIDE_DELAY = 500
const RESET_DELAY = 400
const SAFETY_TIMEOUT = DURATION * 3
/** Keeps the first-load bar on screen long enough to read as progress. */
const BOOT_MIN_VISIBLE = 400

function estimatedProgress(elapsed: number): number {
  const completion = (elapsed / DURATION) * 100
  return (2 / Math.PI) * 100 * Math.atan(completion / 50)
}

export type RouteProgressProps = Readonly<{
  color?: string
  height?: number
}>

export function RouteProgress({ color, height = 3 }: RouteProgressProps) {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  // The first render — server and client alike — is the cold-load bar, which
  // CSS animates before React is interactive. See `booting` below.
  const [visible, setVisible] = useState(true)
  const [booting, setBooting] = useState(true)

  const bar = useRef<HTMLDivElement>(null)
  const running = useRef(false)
  const pathnameRef = useRef(pathname)
  const timers = useRef<{
    raf?: number
    throttle?: number
    hide?: number
    reset?: number
    safety?: number
  }>({})

  const clearTimers = useCallback(() => {
    const { raf, throttle, hide, reset, safety } = timers.current
    if (raf) cancelAnimationFrame(raf)
    for (const id of [throttle, hide, reset, safety]) if (id) clearTimeout(id)
    timers.current = {}
  }, [])

  const finish = useCallback(() => {
    running.current = false
    clearTimers()
    setProgress(100)
    timers.current.hide = window.setTimeout(() => {
      setVisible(false)
      timers.current.reset = window.setTimeout(() => setProgress(0), RESET_DELAY)
    }, HIDE_DELAY)
  }, [clearTimers])

  const start = useCallback(() => {
    if (running.current) return
    running.current = true

    clearTimers()
    setProgress(0)

    const startedAt = Date.now()

    const tick = () => {
      setProgress(estimatedProgress(Date.now() - startedAt))
      timers.current.raf = requestAnimationFrame(tick)
    }

    // Hold off briefly so instant navigations never flash the bar.
    timers.current.throttle = window.setTimeout(() => {
      setVisible(true)
      tick()
    }, THROTTLE)

    timers.current.safety = window.setTimeout(finish, SAFETY_TIMEOUT)
  }, [clearTimers, finish])

  // Cold load: the bar ships in the HTML and CSS advances it while the app
  // boots. Hydration is the "done" signal — freeze the bar where CSS got to,
  // then run it out to 100% so the handoff is a single continuous animation.
  useEffect(() => {
    const track = bar.current?.parentElement
    const trackWidth = track?.getBoundingClientRect().width ?? 0

    if (bar.current && trackWidth > 0) {
      setProgress((bar.current.getBoundingClientRect().width / trackWidth) * 100)
    }

    setBooting(false)

    let raf = 0
    const remaining = Math.max(0, BOOT_MIN_VISIBLE - performance.now())
    const timer = window.setTimeout(() => {
      // Let the frozen width paint first, or the run-out to 100% has nothing
      // to transition from and snaps instead.
      raf = requestAnimationFrame(() => {
        // A navigation that started before hydration owns the bar instead.
        if (!running.current) finish()
      })
    }, remaining)

    return () => {
      clearTimeout(timer)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [finish])

  useEffect(() => {
    if (pathnameRef.current === pathname) return
    pathnameRef.current = pathname
    if (running.current) finish()
  }, [pathname, finish])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest?.('a')
      if (!anchor) return

      const navigates = startsNavigation({
        defaultPrevented: event.defaultPrevented,
        button: event.button,
        modified: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey,
        href: anchor.getAttribute('href'),
        resolvedHref: anchor.href,
        target: anchor.target,
        download: anchor.hasAttribute('download'),
        currentUrl: window.location.href,
      })

      if (navigates) start()
    }

    function onPopState() {
      if (window.location.pathname !== pathnameRef.current) start()
    }

    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPopState)
    const unsubscribe = onRouteProgressStart(start)

    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPopState)
      unsubscribe()
      clearTimers()
    }
  }, [start, clearTimers])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60]"
      style={{ height }}
      data-route-progress={visible ? 'loading' : 'idle'}
    >
      <div
        ref={bar}
        className={cn('h-full w-0', booting && 'docs-route-progress-boot')}
        style={{
          // While booting the width belongs to the CSS animation, which runs
          // without React so it survives a page that has not hydrated yet.
          ...(booting ? null : { width: `${progress}%` }),
          background: color ?? 'var(--primary)',
          opacity: visible ? 1 : 0,
          transition: 'width 0.1s, opacity 0.4s',
        }}
      />
    </div>
  )
}
