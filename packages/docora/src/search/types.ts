export interface SearchDocument {
  path: string
  title: string
  description?: string
  section?: string
  locale?: string
  headings: { text: string; depth: number }[]
  content: string
}

export interface SearchIndex {
  documents: SearchDocument[]
}
