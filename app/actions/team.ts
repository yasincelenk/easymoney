'use server';

import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {sendInviteEmail} from '@/lib/mailer';
import {createAuditLog} from '@/lib/audit';
import {Role} from '@prisma/client';
import {z} from 'zod';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role)
});

export async function inviteMemberAction(input: z.infer<typeof InviteSchema>) {
  const session = await auth();
  if (!session?.user?.id || !session.activeAccountId) {
    throw new Error('Unauthorized');
  }

  const data = InviteSchema.parse(input);

  const membership = await prisma.membership.findFirst({
    where: {accountId: session.activeAccountId, userId: session.user.id}
  });
  if (!membership || (membership.role !== Role.OWNER && membership.role !== Role.ADMIN)) {
    throw new Error('Forbidden');
  }

  const inviteLink = `${process.env.APP_URL ?? 'http://localhost:3000'}/sign-in?invite=${encodeURIComponent(
    session.activeAccountId
  )}`;
  await sendInviteEmail(data.email, inviteLink, data.role);
  await createAuditLog(prisma, {
    accountId: session.activeAccountId,
    actorId: session.user.id,
    action: 'team.invite_sent',
    targetType: 'membership',
    meta: {email: data.email, role: data.role}
  });
  return {sent: true};
}
