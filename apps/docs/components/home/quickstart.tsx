import { Icon, cn } from 'docora'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { CodeWindow } from './code-surface'
import { Container, Section, SectionHeader } from './primitives'

type Step = Readonly<{
  title: string
  body: ReactNode
  code?: string
  lang?: string
  filename?: string
  tabs?: readonly string[]
}>

const STEPS: readonly Step[] = [
  {
    title: 'Create a project',
    body: (
      <>
        The CLI detects your package manager and can scaffold a single-language or i18n starter. See
        the{' '}
        <Link
          href="/docs/getting-started/installation"
          className="font-medium text-primary hover:underline"
        >
          installation guide
        </Link>{' '}
        and{' '}
        <Link
          href="/docs/getting-started/project-structure"
          className="font-medium text-primary hover:underline"
        >
          project structure
        </Link>
        .
      </>
    ),
    code: 'npx create-docora my-docs',
    lang: 'bash',
    filename: 'Terminal',
  },
  {
    title: 'Start the dev server',
    body: 'Preview the site at localhost:3000 with hot reload on every file you touch.',
    code: `cd my-docs
npm run dev

▲ Next.js
- Local: http://localhost:3000`,
    lang: 'bash',
    filename: 'Terminal',
  },
  {
    title: 'Add a page',
    body: 'Drop an .mdx file into content/ and the route and sidebar entry appear on their own.',
    code: `---
title: Getting started
---

Every file under \`content/\` is a route.`,
    lang: 'mdx',
    tabs: ['getting-started.mdx', 'preview'],
  },
]

function StepNumber({ index }: Readonly<{ index: number }>) {
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
        Step
      </span>
      <span className="text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  )
}

function StepCard({
  step,
  index,
  side,
  children,
}: Readonly<{
  step: (typeof STEPS)[number]
  index: number
  side: 'left' | 'right'
  children?: ReactNode
}>) {
  const number = (
    <div
      className={cn(
        'hidden w-20 shrink-0 items-center justify-center self-stretch border-border lg:flex',
        side === 'left' ? 'order-last border-s' : 'order-first border-e',
      )}
    >
      <StepNumber index={index} />
    </div>
  )

  return (
    <article className="relative flex rounded-2xl border border-border bg-background">
      <span
        aria-hidden
        className={cn(
          'absolute top-1/2 z-10 hidden size-2.5 -translate-y-1/2 rotate-45 border-border bg-background lg:block',
          side === 'left'
            ? 'lg:end-0 lg:translate-x-1/2 lg:border-t lg:border-r'
            : 'lg:start-0 lg:-translate-x-1/2 lg:border-b lg:border-l',
        )}
      />

      {number}

      <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary lg:hidden"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="min-w-0 font-semibold tracking-tight text-highlighted">{step.title}</p>
        </div>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
        {children}
      </div>
    </article>
  )
}

export function Quickstart() {
  return (
    <Section id="quickstart">
      <Container>
        <SectionHeader
          eyebrow="Get going"
          eyebrowIcon="rocket"
          title="Up and running in one command"
          description="Scaffold a site, start the dev server, and start writing. Node.js 20.9 or later is required."
        />

        <ol className="relative mt-14 space-y-4 lg:space-y-0">
          <span
            aria-hidden
            className="absolute inset-y-6 start-1/2 hidden w-px -translate-x-1/2 bg-border lg:block"
          />

          {STEPS.map((step, index) => {
            const side = index % 2 === 0 ? 'right' : 'left'

            return (
              <li
                key={step.title}
                className="relative grid items-center lg:grid-cols-[1fr_2.5rem_1fr] lg:gap-x-10 lg:py-5"
              >
                <div className="relative z-10 hidden items-center justify-center lg:col-start-2 lg:row-start-1 lg:flex">
                  <span className="size-3 rounded-full bg-primary ring-4 ring-background" />
                </div>

                <div
                  className={cn(
                    'min-w-0 lg:row-start-1',
                    side === 'left' ? 'lg:col-start-1' : 'lg:col-start-3',
                  )}
                >
                  <StepCard step={step} index={index} side={side}>
                    {step.code ? (
                      <div className="mt-4">
                        <CodeWindow
                          code={step.code}
                          lang={step.lang}
                          filename={step.filename}
                          tabs={step.tabs}
                          className="rounded-xl"
                          bodyClassName="bg-muted/40 [&_.docs-code_pre]:py-4"
                        />
                      </div>
                    ) : null}
                  </StepCard>
                </div>
              </li>
            )
          })}
        </ol>

        <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <Icon name="terminal" className="size-4 text-primary" />
          Already have a Next.js app?
          <Link
            href="/docs/getting-started/installation"
            className="font-medium text-primary hover:underline"
          >
            Wire the theme into it instead
          </Link>
        </p>
      </Container>
    </Section>
  )
}
