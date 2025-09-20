import {ReactNode} from 'react';
import {Inter} from 'next/font/google';
import {NextIntlClientProvider, getMessages, getLocale} from 'next-intl/server';
import './globals.css';
import Providers from './providers';
import {auth} from '@/lib/auth';

const inter = Inter({subsets: ['latin']});

export default async function RootLayout({children}: {children: ReactNode}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const session = await auth();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Istanbul">
          <Providers session={session}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
