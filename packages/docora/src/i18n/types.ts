export interface Locale {
  code: string
  name: string
  dir?: 'ltr' | 'rtl'
}

export interface Messages {
  searchButton: string
  searchPlaceholder: string
  searchEmpty: string
  searchLoading: string
  searchError: string
  searchNavigate: string
  searchOpen: string
  searchClose: string
  searchLinks: string
  searchTheme: string
  themeSystem: string
  themeLight: string
  themeDark: string
  close: string
  tocTitle: string
  previous: string
  next: string
  toggleToDark: string
  toggleToLight: string
  openNavigation: string
  closeNavigation: string
  selectLanguage: string
  documentation: string
}

export interface I18nConfig {
  defaultLocale: string
  locales: Locale[]
  messages?: Record<string, Partial<Messages>>
}
