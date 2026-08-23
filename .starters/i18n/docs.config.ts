import { defineDocsConfig } from 'docora'

export default defineDocsConfig({
  site: {
    name: 'My Docs',
    description: 'Documentation built with Docora.',
    // url: 'https://docs.example.com',
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
    ],
  },

  header: {
    links: [],
  },

  socials: {
    // github: 'https://github.com/your-org/your-repo',
  },

  footer: {
    credits: 'Built with Docora',
    columns: [
      {
        title: 'Docs',
        links: [
          { label: 'Introduction', href: '/en/docs/getting-started/introduction' },
          { label: 'Installation', href: '/en/docs/getting-started/installation' },
          { label: 'Project structure', href: '/en/docs/getting-started/project-structure' },
          { label: 'Components', href: '/en/docs/essentials/components' },
        ],
      },
      {
        title: 'Resources',
        links: [{ label: 'llms.txt', href: '/llms.txt' }],
      },
    ],
  },
})
