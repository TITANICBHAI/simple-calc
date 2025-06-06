import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return {
    locale: resolvedLocale,
    messages: (await import(`../i18n/messages/${resolvedLocale}.json`)).default
  };
});
