import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'
import type { AnchorHTMLAttributes, HTMLAttributes } from 'react'

import { Icon } from '../components/icon'
import {
  Accordion,
  AccordionItem,
  Badge,
  Callout,
  Card,
  CardGroup,
  Caution,
  CodeBlock,
  CodeCollapse,
  CodeGroup,
  CodePreview,
  CodeTree,
  Collapsible,
  Cta,
  CtaSection,
  Feature,
  FeatureGrid,
  Field,
  FieldGroup,
  Hero,
  HeroActions,
  HeroPreview,
  Kbd,
  Logo,
  LogoCloud,
  MdcSlot,
  Note,
  Section,
  Stat,
  StatGrid,
  Steps,
  Tabs,
  TabsItem,
  Tip,
  Video,
  Warning,
} from '../mdc/index'
import { cn } from '../utils/cn'

function imageAlt(alt: string | undefined, src: string) {
  const trimmed = alt?.trim()
  if (trimmed) return trimmed
  const name =
    src
      .split(/[\\/]/)
      .pop()
      ?.split('?')[0]
      ?.replace(/\.[^.]+$/, '') ?? ''
  return name.replace(/[-_]+/g, ' ').trim() || 'Documentation image'
}

function toSize(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function Anchor({
  href = '',
  className,
  children,
  target,
  rel,
  title,
}: Readonly<AnchorHTMLAttributes<HTMLAnchorElement>>) {
  const classes = cn(
    'font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary',
    className,
  )

  if (!href) return <span className={classes}>{children}</span>

  const external = href.startsWith('http')

  return (
    <Link
      href={href}
      className={classes}
      title={title}
      prefetch={href.startsWith('#') ? false : undefined}
      {...(target ? { target, rel } : external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

function Heading({
  as: Tag,
  className,
  children,
  ...props
}: Readonly<HTMLAttributes<HTMLHeadingElement> & { as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }>) {
  return (
    <Tag className={cn('group scroll-m-20', className)} {...props}>
      {children}
      {props.id && (
        <Link
          href={`#${props.id}`}
          prefetch={false}
          aria-label="Link to this section"
          className="ml-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <span aria-hidden>#</span>
        </Link>
      )}
    </Tag>
  )
}

export const defaultMdxComponents: MDXComponents = {
  h1: props => (
    <h1 className="mt-2 scroll-m-20 text-3xl font-bold tracking-tight sm:text-4xl" {...props} />
  ),
  h2: props => (
    <Heading
      as="h2"
      className="mt-12 border-b border-border pb-2 text-2xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: props => <Heading as="h3" className="mt-8 text-xl font-semibold tracking-tight" {...props} />,
  h4: props => <Heading as="h4" className="mt-6 text-lg font-semibold tracking-tight" {...props} />,
  p: props => <p className="mt-4 leading-7 first:mt-0" {...props} />,
  a: Anchor,
  ul: props => <ul className="mt-4 ml-6 list-disc [&>li]:mt-2" {...props} />,
  ol: props => <ol className="mt-4 ml-6 list-decimal [&>li]:mt-2" {...props} />,
  blockquote: props => (
    <blockquote
      className="mt-6 border-l-2 border-primary/40 pl-6 text-muted-foreground italic"
      {...props}
    />
  ),
  hr: props => <hr className="my-10 border-border" {...props} />,
  code: ({ className, ...props }) => (
    <code
      className={cn(
        'rounded-md border border-border bg-muted px-[0.4em] py-[0.2em] font-mono text-[0.875em] text-highlighted [pre_&]:border-0 [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-inherit',
        className,
      )}
      {...props}
    />
  ),
  figure: props =>
    'data-rehype-pretty-code-figure' in props ? <CodeBlock {...props} /> : <figure {...props} />,
  table: props => (
    <div className="mt-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: props => (
    <th
      className="border border-border bg-muted px-4 py-2 text-left font-semibold text-highlighted"
      {...props}
    />
  ),
  td: props => <td className="border border-border px-4 py-2" {...props} />,
  img: ({ src, alt, width, height, className }) => {
    if (typeof src !== 'string' || !src) return null

    return (
      <Image
        src={src}
        alt={imageAlt(alt, src)}
        width={toSize(width, 1600)}
        height={toSize(height, 900)}
        sizes="(min-width: 768px) 768px, 100vw"
        className={cn('mt-6 h-auto w-full rounded-lg border border-border', className)}
        unoptimized={src.startsWith('http') || /\.svg(?:$|\?)/i.test(src)}
      />
    )
  },
}

export const mdxShortcodes: MDXComponents = {
  Callout,
  callout: Callout,
  Note,
  note: Note,
  Tip,
  tip: Tip,
  Warning,
  warning: Warning,
  Caution,
  caution: Caution,
  Badge,
  badge: Badge,
  Kbd,
  kbd: Kbd,
  Icon,
  icon: Icon,
  Card,
  card: Card,
  CardGroup,
  'card-group': CardGroup,
  Accordion,
  accordion: Accordion,
  AccordionItem,
  'accordion-item': AccordionItem,
  Collapsible,
  collapsible: Collapsible,
  Field,
  field: Field,
  FieldGroup,
  'field-group': FieldGroup,
  Steps,
  steps: Steps,
  Tabs,
  tabs: Tabs,
  TabsItem,
  'tabs-item': TabsItem,
  CodeGroup,
  'code-group': CodeGroup,
  CodeCollapse,
  'code-collapse': CodeCollapse,
  CodePreview,
  'code-preview': CodePreview,
  CodeTree,
  'code-tree': CodeTree,
  Video,
  video: Video,
  'mdc-slot': MdcSlot,

  Hero,
  hero: Hero,
  HeroActions,
  'hero-actions': HeroActions,
  HeroPreview,
  'hero-preview': HeroPreview,
  Cta,
  cta: Cta,
  CtaSection,
  'cta-section': CtaSection,
  LogoCloud,
  'logo-cloud': LogoCloud,
  Logo,
  logo: Logo,
  StatGrid,
  'stat-grid': StatGrid,
  Stat,
  stat: Stat,
  Section,
  section: Section,
  Feature,
  feature: Feature,
  FeatureGrid,
  'feature-grid': FeatureGrid,
}

export function getMdxComponents(components?: MDXComponents): MDXComponents {
  return { ...defaultMdxComponents, ...mdxShortcodes, ...components }
}
