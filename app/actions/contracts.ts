'use server';

import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {z} from 'zod';
import {ContractStatus, Language, PartyRole, Plan} from '@prisma/client';
import {enforceContractLimit} from '@/lib/plans';
import {createAuditLog} from '@/lib/audit';
import {suggestClauses} from '@/lib/ai';
import {transitionStatus} from '@/lib/status';

const CreateContractSchema = z.object({
  templateId: z.string(),
  title: z.string().min(3),
  language: z.nativeEnum(Language),
  placeholders: z.record(z.string().min(1)),
  counterpartyName: z.string().optional(),
  counterpartyEmail: z.string().email().optional()
});

const SaveContractSchema = z.object({
  contractId: z.string(),
  body: z.string().min(10)
});

const UpdateStatusSchema = z.object({
  contractId: z.string(),
  status: z.nativeEnum(ContractStatus)
});

function renderTemplate(templateBody: any, values: Record<string, string>) {
  const content: string[] = templateBody?.content ?? [];
  return content
    .map((line) =>
      Object.entries(values).reduce((acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'g'), value), line)
    )
    .join('\n');
}

export async function createContractAction(input: z.infer<typeof CreateContractSchema>) {
  const session = await auth();
  if (!session?.user?.id || !session.activeAccountId) {
    throw new Error('Unauthorized');
  }

  const data = CreateContractSchema.parse(input);

  const membership = await prisma.membership.findFirst({
    where: {accountId: session.activeAccountId, userId: session.user.id}
  });
  if (!membership) {
    throw new Error('Forbidden');
  }

  const template = await prisma.template.findFirst({
    where: {id: data.templateId, accountId: session.activeAccountId},
    include: {account: true}
  });
  if (!template) {
    throw new Error('Template not found');
  }

  const subscription = await prisma.subscription.findFirst({
    where: {accountId: session.activeAccountId},
    orderBy: {createdAt: 'desc'}
  });
  const plan = subscription?.plan ?? Plan.FREE;
  const activeContracts = await prisma.contract.count({
    where: {
      accountId: session.activeAccountId,
      status: {in: [ContractStatus.DRAFT, ContractStatus.REVIEW, ContractStatus.SIGNING]}
    }
  });
  enforceContractLimit(plan, activeContracts);

  const renderedBody = renderTemplate(template.bodyRichtext, data.placeholders);
  const contract = await prisma.contract.create({
    data: {
      accountId: session.activeAccountId,
      templateId: template.id,
      title: data.title,
      language: data.language,
      status: ContractStatus.DRAFT,
      counterpartyName: data.counterpartyName,
      counterpartyEmail: data.counterpartyEmail,
      tags: []
    }
  });

  await prisma.contractVersion.create({
    data: {
      contractId: contract.id,
      versionNo: 1,
      bodyRichtext: {rendered: renderedBody, placeholders: data.placeholders},
      createdBy: session.user.id
    }
  });

  await prisma.party.createMany({
    data: [
      {
        contractId: contract.id,
        name: template.account?.name ?? 'Owner',
        email: session.user.email ?? 'owner@signloop.test',
        role: PartyRole.OWNER
      },
      {
        contractId: contract.id,
        name: data.counterpartyName ?? 'Counterparty',
        email: data.counterpartyEmail ?? 'counterparty@example.com',
        role: PartyRole.COUNTERPARTY
      }
    ]
  });

  await createAuditLog(prisma, {
    accountId: session.activeAccountId,
    actorId: session.user.id,
    action: 'contract.created',
    targetType: 'contract',
    targetId: contract.id,
    meta: {templateId: template.id}
  });

  const suggestions = await suggestClauses(renderedBody);

  return {id: contract.id, suggestions};
}

export async function saveContractVersionAction(input: z.infer<typeof SaveContractSchema>) {
  const session = await auth();
  if (!session?.user?.id || !session.activeAccountId) {
    throw new Error('Unauthorized');
  }
  const data = SaveContractSchema.parse(input);
  const contract = await prisma.contract.findFirst({
    where: {id: data.contractId, accountId: session.activeAccountId},
    include: {versions: {orderBy: {versionNo: 'desc'}, take: 1}}
  });
  if (!contract) {
    throw new Error('Contract not found');
  }
  const nextVersion = (contract.versions[0]?.versionNo ?? 0) + 1;
  await prisma.contractVersion.create({
    data: {
      contractId: contract.id,
      versionNo: nextVersion,
      bodyRichtext: {rendered: data.body},
      createdBy: session.user.id
    }
  });
  await prisma.contract.update({
    where: {id: contract.id},
    data: {updatedAt: new Date()}
  });
  await createAuditLog(prisma, {
    accountId: session.activeAccountId,
    actorId: session.user.id,
    action: 'contract.version_created',
    targetType: 'contract',
    targetId: contract.id,
    meta: {version: nextVersion}
  });
  return {version: nextVersion};
}

export async function updateContractStatusAction(input: z.infer<typeof UpdateStatusSchema>) {
  const session = await auth();
  if (!session?.user?.id || !session.activeAccountId) {
    throw new Error('Unauthorized');
  }
  const data = UpdateStatusSchema.parse(input);
  const contract = await prisma.contract.findFirst({
    where: {id: data.contractId, accountId: session.activeAccountId}
  });
  if (!contract) {
    throw new Error('Contract not found');
  }
  const nextStatus = transitionStatus(contract.status, data.status);
  await prisma.contract.update({
    where: {id: contract.id},
    data: {status: nextStatus}
  });
  await createAuditLog(prisma, {
    accountId: session.activeAccountId,
    actorId: session.user.id,
    action: 'contract.status_changed',
    targetType: 'contract',
    targetId: contract.id,
    meta: {from: contract.status, to: nextStatus}
  });
  return {status: nextStatus};
}
