import type { Frontmatter } from '../mdx/frontmatter'
import type { NavItem } from '../config/types'

export interface PageFrontmatter extends Frontmatter {
  title?: string
  description?: string
  icon?: string
  layout?: 'docs' | 'landing'
  navigation?: boolean | { title?: string; icon?: string }
}

export interface ContentPage {
  slug: string[]
  path: string
  filePath: string
  relativePath: string
  frontmatter: PageFrontmatter
  order: number
  title: string
}

export interface DirectoryMeta {
  title?: string
  icon?: string
  navigation?: boolean
}

export interface PageSurround {
  prev?: NavItem
  next?: NavItem
}
