import Link from 'next/link';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {StatusBadge} from '@/components/contracts/status-badge';
import {formatDate} from '@/lib/utils';

export default async function ContractsPage() {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    redirect('/sign-in');
  }

  const contracts = await prisma.contract.findMany({
    where: {accountId: session.activeAccountId},
    orderBy: {updatedAt: 'desc'},
    include: {
      parties: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contracts</h1>
          <p className="text-sm text-slate-600">Manage your agreements throughout their lifecycle.</p>
        </div>
        <Button asChild>
          <Link href="/contracts/new">New contract</Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.title}</TableCell>
                <TableCell>
                  <StatusBadge status={contract.status} />
                </TableCell>
                <TableCell>
                  {contract.counterpartyName ?? contract.parties.find((p) => p.role === 'COUNTERPARTY')?.name ?? '—'}
                </TableCell>
                <TableCell>{formatDate(contract.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" asChild>
                    <Link href={`/contracts/${contract.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-slate-500">
                  No contracts yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
