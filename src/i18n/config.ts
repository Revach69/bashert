export const locales = ['he', 'en', 'fr', 'es', 'ru', 'ar', 'yi', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'he';

export const RTL_LOCALES: readonly Locale[] = ['he', 'ar', 'yi'];

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale);
}

export const localeNames: Record<Locale, string> = {
  he: 'עברית',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ru: 'Русский',
  ar: 'العربية',
  yi: 'ייִדיש',
  de: 'Deutsch',
};

/**
 * Maps ISO 3166-1 alpha-2 country codes to default locales.
 * Used for Vercel IP-based language detection on first visit.
 */
export const countryToLocale: Record<string, Locale> = {
  // Hebrew
  IL: 'he',

  // English
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en', IN: 'en',
  PH: 'en', SG: 'en', NG: 'en', KE: 'en', GH: 'en',

  // French
  FR: 'fr', BE: 'fr', CH: 'fr', MC: 'fr', LU: 'fr', SN: 'fr', CI: 'fr',
  ML: 'fr', CM: 'fr', MG: 'fr',

  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  EC: 'es', GT: 'es', CU: 'es', DO: 'es', HN: 'es', SV: 'es', PY: 'es',
  NI: 'es', CR: 'es', PA: 'es', UY: 'es', BO: 'es',

  // Russian
  RU: 'ru', UA: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', UZ: 'ru',

  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', JO: 'ar', LB: 'ar', IQ: 'ar',
  KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', YE: 'ar', LY: 'ar', TN: 'ar',
  DZ: 'ar', SD: 'ar', SY: 'ar', PS: 'ar',

  // German
  DE: 'de', AT: 'de', LI: 'de',
};
