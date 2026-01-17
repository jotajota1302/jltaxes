import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales (I18N-01 to I18N-04)
  locales: ['es', 'en', 'de', 'fr'],
  // Spanish as default (primary market is Spain-based properties)
  defaultLocale: 'es',
  // Locale prefix strategy
  localePrefix: 'as-needed'  // No prefix for default locale
});

// Type for locales
export type Locale = (typeof routing.locales)[number];
