'use client';

import {useTransition} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import {SwitchHorizontal} from 'lucide-react';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import {switchAccount} from '@/app/actions/switch-account';

export function OrgSwitcher() {
  const {data: session} = useSession();
  const memberships = session?.user?.memberships ?? [];
  const activeAccount = session?.activeAccountId;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (memberships.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
        <SwitchHorizontal className="h-4 w-4" />
        <span>{memberships[0]?.accountName ?? 'Workspace'}</span>
      </div>
    );
  }

  return (
    <Select
      defaultValue={activeAccount ?? memberships[0]?.accountId}
      onValueChange={(value) =>
        startTransition(async () => {
          await switchAccount(value);
          router.refresh();
        })
      }
      disabled={isPending}
    >
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select account" />
      </SelectTrigger>
      <SelectContent>
        {memberships.map((membership) => (
          <SelectItem key={membership.accountId} value={membership.accountId}>
            {membership.accountName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
