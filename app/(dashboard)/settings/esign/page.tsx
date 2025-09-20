import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {EsignSettingsForm} from '@/components/forms/esign-settings-form';

export default async function EsignSettingsPage() {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    redirect('/sign-in');
  }

  const account = await prisma.account.findUnique({
    where: {id: session.activeAccountId}
  });

  if (!account) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">E-signature</h1>
        <p className="text-sm text-slate-600">Choose signature providers for automated signing flows.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Provider selection</CardTitle>
          <CardDescription>Stubs are provided for EGüven and TURKTRUST integrations.</CardDescription>
        </CardHeader>
        <CardContent>
          <EsignSettingsForm initialProvider={account.esignProvider} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Implementation notes</CardTitle>
          <CardDescription>Where to plug a real e-signature API.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>
            This environment ships with provider stubs. When integrating a production signing provider, implement the adapter in
            <code className="rounded bg-slate-100 px-1 py-0.5">/app/api/webhooks/esign</code> and update <code>lib/storage.ts</code>
            to persist generated PDFs in object storage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
