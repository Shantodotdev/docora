import type { CSSProperties } from 'react'

export const TOC_LINK_HEIGHT_REM = 1.75

const SVG_UNIT = 16
const ROW = TOC_LINK_HEIGHT_REM * SVG_UNIT
const X_ROOT = 0.5
const X_NESTED = 10.5
const JOG = 6

export function circuitRailStyle(levels: number[]): CSSProperties | undefined {
  if (levels.length === 0) return undefined

  let path = ''
  let currentX = X_ROOT
  let y = 0

  levels.forEach((level, index) => {
    const targetX = level > 0 ? X_NESTED : X_ROOT
    const nextY = y + ROW

    if (index === 0) {
      path += `M${targetX} ${y}`
      currentX = targetX
    }

    if (targetX !== currentX) {
      path += ` L${targetX} ${y + JOG}`
      currentX = targetX
    }

    const stopsShort = index < levels.length - 1 && levels[index + 1] !== level
    path += ` L${currentX} ${nextY - (stopsShort ? JOG : 0)}`
    y = nextY
  })

  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 ${levels.length * ROW}'>` +
      `<path d='${path}' stroke='black' stroke-width='1' fill='none'/></svg>`,
  )
  const mask = `url("data:image/svg+xml,${svg}")`

  return {
    width: '0.75rem',
    height: `${levels.length * TOC_LINK_HEIGHT_REM}rem`,
    maskImage: mask,
    WebkitMaskImage: mask,
  }
}
