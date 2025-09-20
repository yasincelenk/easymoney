import {ContractStatus} from '@prisma/client';
import {Badge} from '@/components/ui/badge';

const STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Draft',
  [ContractStatus.REVIEW]: 'Review',
  [ContractStatus.SIGNING]: 'Signing',
  [ContractStatus.SIGNED]: 'Signed',
  [ContractStatus.EXPIRED]: 'Expired',
  [ContractStatus.CANCELLED]: 'Cancelled'
};

const STATUS_VARIANTS: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [ContractStatus.DRAFT]: 'secondary',
  [ContractStatus.REVIEW]: 'default',
  [ContractStatus.SIGNING]: 'default',
  [ContractStatus.SIGNED]: 'default',
  [ContractStatus.EXPIRED]: 'outline',
  [ContractStatus.CANCELLED]: 'destructive'
};

export function StatusBadge({status}: {status: ContractStatus}) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
