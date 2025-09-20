'use server';

import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {SignatureProvider} from '@prisma/client';
import {z} from 'zod';
import {createAuditLog} from '@/lib/audit';

const UpdateEsignSchema = z.object({
  provider: z.nativeEnum(SignatureProvider)
});

export async function updateEsignProviderAction(input: z.infer<typeof UpdateEsignSchema>) {
  const session = await auth();
  if (!session?.user?.id || !session.activeAccountId) {
    throw new Error('Unauthorized');
  }

  const data = UpdateEsignSchema.parse(input);

  await prisma.account.update({
    where: {id: session.activeAccountId},
    data: {esignProvider: data.provider}
  });

  await createAuditLog(prisma, {
    accountId: session.activeAccountId,
    actorId: session.user.id,
    action: 'settings.esign_updated',
    targetType: 'account',
    targetId: session.activeAccountId,
    meta: {provider: data.provider}
  });

  return {success: true};
}
