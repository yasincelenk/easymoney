import type {PrismaClient} from '@prisma/client';

export type AuditLogInput = {
  accountId: string;
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  contractId?: string;
};

export async function createAuditLog(client: PrismaClient, input: AuditLogInput) {
  return client.auditLog.create({
    data: {
      accountId: input.accountId,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      contractId: input.contractId,
      meta: input.meta ?? {}
    }
  });
}
