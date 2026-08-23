import type { DocsConfig } from './types'

export function defineDocsConfig(config: DocsConfig): DocsConfig {
  return config
}

export const fallbackDocsConfig: DocsConfig = {
  site: { name: 'Documentation' },
}
