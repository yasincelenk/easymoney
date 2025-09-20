import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {PLAN_CONFIG} from '@/lib/plans';
import {Plan} from '@prisma/client';
import {PlanButton} from '@/components/billing/plan-button';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user || !session.activeAccountId) {
    redirect('/sign-in');
  }

  const subscription = await prisma.subscription.findFirst({
    where: {accountId: session.activeAccountId},
    orderBy: {createdAt: 'desc'}
  });

  const currentPlan = subscription?.plan ?? Plan.FREE;
  const order: Record<Plan, number> = {
    [Plan.FREE]: 0,
    [Plan.STARTER]: 1,
    [Plan.PRO]: 2
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-600">Manage your subscription and upgrade to unlock more features.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLAN_CONFIG) as Plan[]).map((plan) => {
          const config = PLAN_CONFIG[plan];
          const isCurrent = plan === currentPlan;
          return (
            <Card key={plan} className={isCurrent ? 'border-primary' : undefined}>
              <CardHeader>
                <CardTitle>{config.name}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-semibold">
                  {config.monthlyPrice === 0 ? 'Free' : `$${config.monthlyPrice}/mo`}
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>User limit: {config.userLimit}</li>
                  <li>Active contracts: {config.activeContractLimit === Infinity ? 'Unlimited' : config.activeContractLimit}</li>
                  <li>E-sign providers: {config.allowedProviders.join(', ')}</li>
                </ul>
                {isCurrent ? (
                  <span className="text-sm font-medium text-green-600">Current plan</span>
                ) : (
                  <PlanButton plan={plan} label={order[plan] > order[currentPlan] ? 'Upgrade' : 'Downgrade'} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
