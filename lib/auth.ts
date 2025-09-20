import NextAuth, {type DefaultSession} from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import {PrismaAdapter} from '@auth/prisma-adapter';
import type {PrismaClient} from '@prisma/client';
import {cookies} from 'next/headers';
import {prisma} from './prisma';
import {createAccountForUser} from './onboarding';
import {createAuditLog} from './audit';

export type AppSession = DefaultSession & {
  user: DefaultSession['user'] & {
    id: string;
    memberships: Array<{
      accountId: string;
      role: string;
      accountName: string;
    }>;
  };
  activeAccountId?: string;
  activeRole?: string;
};

declare module 'next-auth' {
  interface Session extends AppSession {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    accountId?: string;
  }
}

async function ensureDefaultMembership(client: PrismaClient, userId: string) {
  const membership = await client.membership.findFirst({
    where: {userId},
    include: {account: true}
  });

  if (membership) {
    return membership.accountId;
  }

  const account = await createAccountForUser(client, userId);
  return account.id;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {strategy: 'jwt' as const},
  trustHost: true,
  providers: [
    EmailProvider({
      async sendVerificationRequest({identifier, url}) {
        console.info('Magic link for %s: %s', identifier, url);
      },
      from: 'no-reply@signloop.test'
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? 'google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'google-client-secret'
    })
  ],
  callbacks: {
    async session({session, token}: {session: DefaultSession; token: any}) {
      if (token?.sub) {
        const memberships = await prisma.membership.findMany({
          where: {userId: token.sub},
          include: {account: true}
        });
        const cookieAccountId = cookies().get('signloop-account')?.value;
        const activeAccountId = cookieAccountId ?? token.accountId ?? memberships[0]?.accountId;
        const activeMembership = memberships.find((m) => m.accountId === activeAccountId);

        session.user = {
          ...session.user,
          id: token.sub,
          email: session.user?.email ?? undefined,
          memberships: memberships.map((membership) => ({
            accountId: membership.accountId,
            role: membership.role,
            accountName: membership.account.name
          }))
        } as AppSession['user'];
        session.activeAccountId = activeAccountId;
        session.activeRole = activeMembership?.role;
      }
      return session as AppSession;
    },
    async jwt({token, user, trigger, session}: any) {
      if (user) {
        token.sub = user.id;
      }
      if (trigger === 'update' && session?.activeAccountId) {
        token.accountId = session.activeAccountId;
      }
      if (token.sub && !token.accountId) {
        token.accountId = await ensureDefaultMembership(prisma, token.sub);
      }
      return token;
    }
  },
  events: {
    async createUser({user}: any) {
      const account = await createAccountForUser(prisma, user.id);
      await createAuditLog(prisma, {
        accountId: account.id,
        actorId: user.id,
        action: 'user.created',
        targetType: 'user',
        targetId: user.id,
        meta: {email: user.email}
      });
    },
    async signIn({user}: any) {
      if (user?.id) {
        const accountId = await ensureDefaultMembership(prisma, user.id);
        await createAuditLog(prisma, {
          accountId,
          actorId: user.id,
          action: 'auth.sign_in',
          targetType: 'user',
          targetId: user.id
        });
      }
    }
  }
} satisfies Parameters<typeof NextAuth>[0];

export const {handlers, auth, signIn, signOut} = NextAuth(authOptions);
