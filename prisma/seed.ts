import {PrismaClient, ContractStatus, Language, Jurisdiction, PartyRole, Plan, Role, SignatureProvider, SignatureStatus, ReminderKind} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordlessEmail = 'demo@signloop.test';
  const existingUser = await prisma.user.upsert({
    where: {email: passwordlessEmail},
    update: {},
    create: {
      email: passwordlessEmail,
      name: 'Demo Owner'
    }
  });

  const trAccount = await prisma.account.upsert({
    where: {id: 'demo-tr'},
    update: {},
    create: {
      id: 'demo-tr',
      name: 'İstanbul Teknoloji',
      locale: 'tr',
      timezone: 'Europe/Istanbul',
      esignProvider: SignatureProvider.MANUAL
    }
  });

  await prisma.membership.upsert({
    where: {userId_accountId: {userId: existingUser.id, accountId: trAccount.id}},
    update: {role: Role.OWNER},
    create: {
      userId: existingUser.id,
      accountId: trAccount.id,
      role: Role.OWNER
    }
  });

  const enAccount = await prisma.account.upsert({
    where: {id: 'demo-en'},
    update: {},
    create: {
      id: 'demo-en',
      name: 'Global Services Ltd',
      locale: 'en',
      timezone: 'Europe/London',
      esignProvider: SignatureProvider.MANUAL
    }
  });

  await prisma.membership.upsert({
    where: {userId_accountId: {userId: existingUser.id, accountId: enAccount.id}},
    update: {role: Role.ADMIN},
    create: {
      userId: existingUser.id,
      accountId: enAccount.id,
      role: Role.ADMIN
    }
  });

  const templateData = [
    {
      title: 'TR Hizmet Sözleşmesi',
      jurisdiction: Jurisdiction.TR,
      language: Language.tr,
      placeholders: ['company_name', 'service_scope', 'price', 'term_months', 'jurisdiction'],
      body: {
        type: 'doc',
        content: ['Hizmet Sözleşmesi {company_name}', 'Hizmet kapsamı: {service_scope}']
      }
    },
    {
      title: 'TR Gizlilik Sözleşmesi',
      jurisdiction: Jurisdiction.TR,
      language: Language.tr,
      placeholders: ['company_name', 'term_months'],
      body: {
        type: 'doc',
        content: ['Taraflar gizlilik taahhüdü verir.']
      }
    },
    {
      title: 'TR Satış Sözleşmesi',
      jurisdiction: Jurisdiction.TR,
      language: Language.tr,
      placeholders: ['company_name', 'price'],
      body: {
        type: 'doc',
        content: ['Satış koşulları {price} TL.']
      }
    },
    {
      title: 'EN NDA',
      jurisdiction: Jurisdiction.INTL,
      language: Language.en,
      placeholders: ['company_name', 'term_months'],
      body: {
        type: 'doc',
        content: ['This NDA protects confidential information.']
      }
    },
    {
      title: 'EN Services Agreement',
      jurisdiction: Jurisdiction.INTL,
      language: Language.en,
      placeholders: ['company_name', 'service_scope', 'price'],
      body: {
        type: 'doc',
        content: ['Services provided by {company_name}.']
      }
    }
  ];

  await Promise.all(
    templateData.map((template) =>
      prisma.template.upsert({
        where: {
          id: `${template.language === Language.en ? enAccount.id : trAccount.id}-${template.title}`
        },
        update: {},
        create: {
          id: `${template.language === Language.en ? enAccount.id : trAccount.id}-${template.title}`,
          accountId: template.language === Language.en ? enAccount.id : trAccount.id,
          title: template.title,
          jurisdiction: template.jurisdiction,
          language: template.language,
          placeholders: template.placeholders,
          bodyRichtext: template.body
        }
      })
    )
  );

  const demoContracts = [
    {
      title: 'İstanbul Teknoloji Hizmet',
      accountId: trAccount.id,
      status: ContractStatus.REVIEW,
      language: Language.tr,
      counterpartyName: 'Acme A.Ş.',
      counterpartyEmail: 'contact@acme.test'
    },
    {
      title: 'Global Services NDA',
      accountId: enAccount.id,
      status: ContractStatus.SIGNING,
      language: Language.en,
      counterpartyName: 'Future Corp',
      counterpartyEmail: 'legal@future.test'
    },
    {
      title: 'İstanbul Satış Sözleşmesi',
      accountId: trAccount.id,
      status: ContractStatus.SIGNED,
      language: Language.tr,
      counterpartyName: 'Delta Ltd',
      counterpartyEmail: 'delta@example.com'
    }
  ];

  for (const [index, contractSeed] of demoContracts.entries()) {
    const contract = await prisma.contract.upsert({
      where: {id: `${contractSeed.accountId}-contract-${index}`},
      update: {},
      create: {
        id: `${contractSeed.accountId}-contract-${index}`,
        accountId: contractSeed.accountId,
        title: contractSeed.title,
        status: contractSeed.status,
        language: contractSeed.language,
        counterpartyName: contractSeed.counterpartyName,
        counterpartyEmail: contractSeed.counterpartyEmail,
        tags: ['demo']
      }
    });

    await prisma.contractVersion.upsert({
      where: {id: `${contract.id}-v1`},
      update: {},
      create: {
        id: `${contract.id}-v1`,
        contractId: contract.id,
        versionNo: 1,
        bodyRichtext: {rendered: `${contract.title} initial draft`},
        createdBy: existingUser.id
      }
    });

    await prisma.party.upsert({
      where: {id: `${contract.id}-owner`},
      update: {},
      create: {
        id: `${contract.id}-owner`,
        contractId: contract.id,
        name: contractSeed.accountId === trAccount.id ? 'İstanbul Teknoloji' : 'Global Services',
        email: 'owner@signloop.test',
        role: PartyRole.OWNER
      }
    });

    const counterparty = await prisma.party.upsert({
      where: {id: `${contract.id}-counterparty`},
      update: {},
      create: {
        id: `${contract.id}-counterparty`,
        contractId: contract.id,
        name: contractSeed.counterpartyName ?? 'Unknown',
        email: contractSeed.counterpartyEmail ?? 'counterparty@example.com',
        role: PartyRole.COUNTERPARTY
      }
    });

    await prisma.signature.upsert({
      where: {id: `${contract.id}-signature`},
      update: {},
      create: {
        id: `${contract.id}-signature`,
        contractId: contract.id,
        partyId: counterparty.id,
        provider: SignatureProvider.MANUAL,
        status: contractSeed.status === ContractStatus.SIGNED ? SignatureStatus.SIGNED : SignatureStatus.PENDING
      }
    });
  }

  await prisma.reminder.upsert({
    where: {id: 'reminder-1'},
    update: {},
    create: {
      id: 'reminder-1',
      contractId: `${trAccount.id}-contract-0`,
      kind: ReminderKind.RENEWAL,
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  await prisma.reminder.upsert({
    where: {id: 'reminder-2'},
    update: {},
    create: {
      id: 'reminder-2',
      contractId: `${enAccount.id}-contract-1`,
      kind: ReminderKind.EXPIRY,
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  });

  await prisma.subscription.upsert({
    where: {id: `${trAccount.id}-sub`},
    update: {},
    create: {
      id: `${trAccount.id}-sub`,
      accountId: trAccount.id,
      plan: Plan.STARTER,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  console.log('Seeded Signloop demo data');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
