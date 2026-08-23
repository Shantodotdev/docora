import { defineDocsConfig } from 'docora'

export default defineDocsConfig({
  site: {
    name: 'Docora',
    description: 'Beautiful documentation for Next.js and React.',
    url: 'https://docora.example.com',
    locale: 'en',
  },

  header: {
    logo: {
      light: '/logo.svg',
      alt: 'Docora',
    },
    links: [],
  },

  socials: {
    github: 'https://github.com/StaticMania/docora',
  },

  assistant: {
    model: 'google/gemini-2.5-flash',
    suggestions: [
      'How do I add a new page?',
      'How does the sidebar order work?',
      'What MDC components are available?',
    ],
  },

  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      links: [
        {
          label: 'Report an issue',
          href: 'https://github.com/StaticMania/docora/issues',
          icon: 'book-open',
        },
      ],
    },
  },

  github: {
    url: 'https://github.com/StaticMania/docora',
    branch: 'main',
    rootDir: 'apps/docs',
  },

  footer: {
    credits: 'Built with Docora',
    columns: [
      {
        title: 'Docs',
        links: [
          { label: 'Introduction', href: '/docs/getting-started/introduction' },
          { label: 'Configuration', href: '/docs/core-concepts/configuration' },
          { label: 'Theme', href: '/docs/core-concepts/theme' },
          { label: 'Customization', href: '/docs/core-concepts/customization' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Changelog', href: '/changelog' },
          { label: 'GitHub', href: 'https://github.com/StaticMania/docora' },
          { label: 'Report an issue', href: 'https://github.com/StaticMania/docora/issues' },
          { label: 'llms.txt', href: '/llms.txt' },
        ],
      },
    ],
  },
})
