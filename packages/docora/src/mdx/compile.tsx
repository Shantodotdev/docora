import { readFile } from 'node:fs/promises'
import type { ReactElement } from 'react'
import * as runtime from 'react/jsx-runtime'
import { evaluate, type EvaluateOptions } from '@mdx-js/mdx'
import type { MDXComponents } from 'mdx/types'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMdc from 'remark-mdc'

import { prettyCodeOptions, rehypePrettyCodeFigure } from './code-meta'
import { mdcHandlers } from './mdc'

import { getMdxComponents } from './components'
import { splitFrontmatter, type Frontmatter } from './frontmatter'
import { rehypeCollectToc, type TocEntry } from './toc'

export interface CompileMdxOptions {
  components?: MDXComponents
  remarkPlugins?: EvaluateOptions['remarkPlugins']
  rehypePlugins?: EvaluateOptions['rehypePlugins']
}

export interface CompiledMdx<F extends Frontmatter = Frontmatter> {
  content: ReactElement
  frontmatter: F
  toc: TocEntry[]
}

export async function compileMdx<F extends Frontmatter = Frontmatter>(
  source: string,
  options: CompileMdxOptions = {},
): Promise<CompiledMdx<F>> {
  const { data, body } = splitFrontmatter<F>(source)
  const toc: TocEntry[] = []

  const { default: MdxContent } = await evaluate(body, {
    ...runtime,
    development: false,
    remarkPlugins: [remarkMdc, remarkGfm, ...(options.remarkPlugins ?? [])],
    remarkRehypeOptions: { handlers: mdcHandlers },
    rehypePlugins: [
      rehypeSlug,
      rehypeCollectToc(toc),
      [rehypePrettyCode, prettyCodeOptions],
      rehypePrettyCodeFigure,
      ...(options.rehypePlugins ?? []),
    ],
  } as EvaluateOptions)

  return {
    frontmatter: data,
    toc,
    content: <MdxContent components={getMdxComponents(options.components)} />,
  }
}

export async function compileMdxFile<F extends Frontmatter = Frontmatter>(
  filePath: string,
  options?: CompileMdxOptions,
): Promise<CompiledMdx<F>> {
  return compileMdx<F>(await readFile(filePath, 'utf8'), options)
}
