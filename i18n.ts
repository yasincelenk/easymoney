import {getRequestConfig} from 'next-intl/server';

export const locales = ['tr', 'en'] as const;
export const defaultLocale = 'tr';

export default getRequestConfig(async ({locale}) => ({
  locale,
  messages: (await import(`./public/i18n/${locale}.json`)).default
}));
