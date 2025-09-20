import type {PrismaClient} from '@prisma/client';
import {Role, Plan, SignatureProvider} from '@prisma/client';
import {createAuditLog} from './audit';

export async function createAccountForUser(client: PrismaClient, userId: string) {
  const existingMembership = await client.membership.findFirst({where: {userId}});
  if (existingMembership) {
    return client.account.findUniqueOrThrow({where: {id: existingMembership.accountId}});
  }

  const user = await client.user.findUnique({where: {id: userId}});
  const account = await client.account.create({
    data: {
      name: user?.name ?? `Signloop Workspace`,
      locale: user?.email?.endsWith('.com') ? 'en' : 'tr',
      esignProvider: SignatureProvider.MANUAL
    }
  });

  await client.membership.create({
    data: {
      accountId: account.id,
      userId,
      role: Role.OWNER
    }
  });

  await client.subscription.create({
    data: {
      accountId: account.id,
      plan: Plan.FREE,
      status: 'active'
    }
  });

  await createAuditLog(client, {
    accountId: account.id,
    actorId: userId,
    action: 'account.created',
    targetType: 'account',
    targetId: account.id
  });

  return account;
}
