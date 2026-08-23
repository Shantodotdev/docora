import { defineDocsConfig } from 'docora'

export default defineDocsConfig({
  site: {
    name: 'Playground',
    description: 'Scratch app for developing the theme.',
    locale: 'en',
  },

  header: {
    links: [{ label: 'Kitchen sink', href: '/docs/kitchen-sink' }],
  },

  footer: {
    credits: 'docora playground',
  },
})
