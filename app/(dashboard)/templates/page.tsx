import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {formatDate} from '@/lib/utils';

export default async function TemplatesPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Templates</h1>
          <p className="text-sm text-slate-600">Curated clauses for faster drafting.</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/templates/new">New template</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>
                {template.jurisdiction} · {template.language.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>{template.placeholders.length} placeholders</p>
              <p>Updated {formatDate(template.updatedAt)}</p>
              <Button asChild variant="ghost" className="px-0 text-primary">
                <Link href={`/templates/${template.id}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && <p className="text-sm text-slate-500">No templates yet.</p>}
      </div>
    </div>
  );
}
