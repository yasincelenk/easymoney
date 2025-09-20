'use client';

import {SessionProvider} from 'next-auth/react';
import {ReactNode} from 'react';
import {Toaster} from '@/components/ui/toaster';

export default function Providers({children, session}: {children: ReactNode; session: any}) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
