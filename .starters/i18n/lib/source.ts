import { createDocsSource, defaultContentDir } from 'docora'

import docsConfig from '../docs.config'

export const source = createDocsSource({
  contentDir: defaultContentDir(),
  i18n: docsConfig.i18n,
})
