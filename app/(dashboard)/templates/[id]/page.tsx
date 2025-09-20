import {notFound, redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

interface TemplatePageProps {
  params: {id: string};
}

export default async function TemplatePage({params}: TemplatePageProps) {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    redirect('/sign-in');
  }

  const template = await prisma.template.findFirst({
    where: {id: params.id, accountId: session.activeAccountId}
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{template.title}</h1>
        <p className="text-sm text-slate-600">
          {template.jurisdiction} · {template.language.toUpperCase()}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Placeholders</CardTitle>
          <CardDescription>Use these keys in contract creation.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-6 text-sm text-slate-600">
            {template.placeholders.map((placeholder) => (
              <li key={placeholder}>{placeholder}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Body</CardTitle>
          <CardDescription>Preview of the template body.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {JSON.stringify(template.bodyRichtext, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
