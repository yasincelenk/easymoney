import {ContractStatus} from '@prisma/client';
import {cn} from '@/lib/utils';

const STEPS: ContractStatus[] = [
  ContractStatus.DRAFT,
  ContractStatus.REVIEW,
  ContractStatus.SIGNING,
  ContractStatus.SIGNED
];

const LABELS: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Draft',
  [ContractStatus.REVIEW]: 'Review',
  [ContractStatus.SIGNING]: 'Signing',
  [ContractStatus.SIGNED]: 'Signed',
  [ContractStatus.EXPIRED]: 'Expired',
  [ContractStatus.CANCELLED]: 'Cancelled'
};

export function StatusTimeline({status}: {status: ContractStatus}) {
  return (
    <ol className="flex items-center gap-4 text-xs font-medium">
      {STEPS.map((step, index) => {
        const isCompleted = STEPS.indexOf(status) >= index || status === ContractStatus.SIGNED;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn('flex h-6 w-6 items-center justify-center rounded-full border', {
                'border-primary bg-primary text-white': isCompleted,
                'border-slate-300 text-slate-500': !isCompleted
              })}
            >
              {index + 1}
            </span>
            <span className={cn({'text-slate-400': !isCompleted})}>{LABELS[step]}</span>
            {index < STEPS.length - 1 ? <span className="mx-2 h-px w-8 bg-slate-200" /> : null}
          </li>
        );
      })}
      {status === ContractStatus.CANCELLED || status === ContractStatus.EXPIRED ? (
        <li className="rounded-full border border-red-500 px-3 py-1 text-red-600">
          {LABELS[status]}
        </li>
      ) : null}
    </ol>
  );
}
