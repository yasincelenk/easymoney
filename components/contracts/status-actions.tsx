'use client';

import {ContractStatus} from '@prisma/client';
import {useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {updateContractStatusAction} from '@/app/actions/contracts';

const STATUSES = [
  ContractStatus.DRAFT,
  ContractStatus.REVIEW,
  ContractStatus.SIGNING,
  ContractStatus.SIGNED,
  ContractStatus.CANCELLED
];

const LABELS: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Draft',
  [ContractStatus.REVIEW]: 'Review',
  [ContractStatus.SIGNING]: 'Signing',
  [ContractStatus.SIGNED]: 'Signed',
  [ContractStatus.EXPIRED]: 'Expired',
  [ContractStatus.CANCELLED]: 'Cancelled'
};

export function StatusActions({contractId, status}: {contractId: string; status: ContractStatus}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      defaultValue={status}
      onValueChange={(value) =>
        startTransition(async () => {
          await updateContractStatusAction({contractId, status: value as ContractStatus});
          router.refresh();
        })
      }
      disabled={isPending}
    >
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((item) => (
          <SelectItem key={item} value={item}>
            {LABELS[item]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
