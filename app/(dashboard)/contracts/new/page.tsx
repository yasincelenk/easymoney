import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {NewContractWizard} from '@/components/contracts/new-contract-wizard';

export default async function NewContractPage() {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    redirect('/sign-in');
  }

  const templates = await prisma.template.findMany({
    where: {accountId: session.activeAccountId},
    orderBy: {updatedAt: 'desc'}
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Create contract</h1>
        <p className="text-sm text-slate-600">Start from a template and tailor placeholders for your counterparty.</p>
      </div>
      <NewContractWizard
        templates={templates.map((template) => ({
          id: template.id,
          title: template.title,
          language: template.language,
          jurisdiction: template.jurisdiction,
          placeholders: template.placeholders,
          bodyRichtext: template.bodyRichtext
        }))}
      />
    </div>
  );
}
