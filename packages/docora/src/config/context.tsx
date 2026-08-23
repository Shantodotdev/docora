'use client'

import { createContext, useContext, type ReactNode } from 'react'

import { fallbackDocsConfig } from './define'
import type { DocsConfig } from './types'

const DocsConfigContext = createContext<DocsConfig>(fallbackDocsConfig)

export function DocsConfigProvider({
  config,
  children,
}: Readonly<{
  config: DocsConfig
  children: ReactNode
}>) {
  return <DocsConfigContext.Provider value={config}>{children}</DocsConfigContext.Provider>
}

export function useDocsConfig(): DocsConfig {
  return useContext(DocsConfigContext)
}
