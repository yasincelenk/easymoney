import {notFound, redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {StatusBadge} from '@/components/contracts/status-badge';
import {StatusTimeline} from '@/components/contracts/status-timeline';
import {ContractEditor} from '@/components/contracts/contract-editor';
import {VersionDiff} from '@/components/contracts/version-diff';
import {StatusActions} from '@/components/contracts/status-actions';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {formatDate} from '@/lib/utils';

interface ContractPageProps {
  params: {id: string};
}

export default async function ContractPage({params}: ContractPageProps) {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    redirect('/sign-in');
  }

  const contract = await prisma.contract.findFirst({
    where: {id: params.id, accountId: session.activeAccountId},
    include: {
      template: true,
      versions: {orderBy: {versionNo: 'desc'}},
      auditLogs: {orderBy: {createdAt: 'desc'}, take: 20},
      parties: true,
      signatures: {include: {party: true}},
      files: true
    }
  });

  if (!contract) {
    notFound();
  }

  const latestVersion = contract.versions[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{contract.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
            <StatusBadge status={contract.status} />
            <span>Counterparty: {contract.counterpartyName ?? '—'}</span>
            <span>Last updated: {formatDate(contract.updatedAt)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusActions contractId={contract.id} status={contract.status} />
          <StatusTimeline status={contract.status} />
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Contract content</CardTitle>
              <CardDescription>Editing creates a new version automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContractEditor contractId={contract.id} initialBody={String(latestVersion?.bodyRichtext?.rendered ?? '')} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="versions">
          <div className="space-y-4">
            {contract.versions.map((version, index) => {
              const previous = contract.versions[index + 1];
              return (
                <Card key={version.id}>
                  <CardHeader>
                    <CardTitle>Version {version.versionNo}</CardTitle>
                    <CardDescription>Created {formatDate(version.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {previous ? (
                      <VersionDiff
                        previous={String(previous.bodyRichtext?.rendered ?? '')}
                        next={String(version.bodyRichtext?.rendered ?? '')}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {String(version.bodyRichtext?.rendered ?? '')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {contract.versions.length === 0 && <p className="text-sm text-slate-500">No versions recorded yet.</p>}
          </div>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Audit trail</CardTitle>
              <CardDescription>Key actions recorded for compliance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contract.auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{log.action}</p>
                    <p className="text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">{log.targetType}</span>
                </div>
              ))}
              {contract.auditLogs.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="parties">
          <Card>
            <CardHeader>
              <CardTitle>Parties & signatures</CardTitle>
              <CardDescription>Track who owns and signs the agreement.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Signature status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.parties.map((party) => {
                    const signature = contract.signatures.find((item) => item.partyId === party.id);
                    return (
                      <TableRow key={party.id}>
                        <TableCell>{party.name}</TableCell>
                        <TableCell>{party.email}</TableCell>
                        <TableCell>{party.role}</TableCell>
                        <TableCell>{signature?.status ?? 'PENDING'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
              <CardDescription>Uploaded documents for this contract.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contract.files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>{file.path.split('/').pop()}</TableCell>
                      <TableCell>{(file.size / 1024).toFixed(1)} KB</TableCell>
                      <TableCell>{formatDate(file.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {contract.files.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-slate-500">
                        No files uploaded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
