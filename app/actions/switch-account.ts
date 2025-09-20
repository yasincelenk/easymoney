'use server';

import {cookies} from 'next/headers';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function switchAccount(accountId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const membership = await prisma.membership.findFirst({
    where: {userId: session.user.id, accountId}
  });
  if (!membership) {
    throw new Error('Forbidden');
  }

  cookies().set('signloop-account', accountId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  });
}
