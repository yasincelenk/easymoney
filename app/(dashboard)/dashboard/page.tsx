import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {redirect} from 'next/navigation';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatDate} from '@/lib/utils';
import {ContractStatus, SignatureStatus} from '@prisma/client';

async function getDashboardData(accountId: string) {
  const [activeContracts, pendingSignatures, reminders, recentActivities] = await Promise.all([
    prisma.contract.count({where: {accountId, status: {in: [ContractStatus.REVIEW, ContractStatus.SIGNING, ContractStatus.SIGNED]}}}),
    prisma.signature.count({
      where: {
        contract: {accountId},
        status: SignatureStatus.PENDING
      }
    }),
    prisma.reminder.findMany({
      where: {contract: {accountId}},
      orderBy: {dueAt: 'asc'},
      take: 5,
      include: {contract: true}
    }),
    prisma.auditLog.findMany({
      where: {accountId},
      orderBy: {createdAt: 'desc'},
      take: 10
    })
  ]);

  const signedThisMonth = await prisma.contract.count({
    where: {
      accountId,
      status: ContractStatus.SIGNED,
      updatedAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }
  });

  return {activeContracts, pendingSignatures, reminders, recentActivities, signedThisMonth};
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    redirect('/sign-in');
  }

  const data = await getDashboardData(session.activeAccountId);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Active contracts</CardDescription>
            <CardTitle className="text-3xl">{data.activeContracts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pending signatures</CardDescription>
            <CardTitle className="text-3xl">{data.pendingSignatures}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Upcoming renewals</CardDescription>
            <CardTitle className="text-3xl">{data.reminders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Signed this month</CardDescription>
            <CardTitle className="text-3xl">{data.signedThisMonth}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming reminders</CardTitle>
            <CardDescription>Stay ahead of renewals and expirations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.reminders.length === 0 && <p className="text-sm text-slate-500">No reminders scheduled.</p>}
            {data.reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{reminder.contract.title}</p>
                  <p className="text-xs text-slate-500">Due {formatDate(reminder.dueAt)}</p>
                </div>
                <Badge variant="secondary">{reminder.kind.toLowerCase()}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest events in your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivities.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">{formatDate(activity.createdAt)}</p>
                </div>
                <Badge variant="outline">{activity.targetType}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
