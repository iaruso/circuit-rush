import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'pt', 'es', 'fr', 'it', 'de', 'ru', 'jp', 'zh', 'ar'],
  defaultLocale: 'en',
  localeDetection: true
});