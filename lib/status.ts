import {ContractStatus} from '@prisma/client';

const transitions: Record<ContractStatus, ContractStatus[]> = {
  [ContractStatus.DRAFT]: [ContractStatus.REVIEW, ContractStatus.CANCELLED],
  [ContractStatus.REVIEW]: [ContractStatus.SIGNING, ContractStatus.CANCELLED],
  [ContractStatus.SIGNING]: [ContractStatus.SIGNED, ContractStatus.CANCELLED],
  [ContractStatus.SIGNED]: [],
  [ContractStatus.EXPIRED]: [],
  [ContractStatus.CANCELLED]: []
};

export function canTransition(current: ContractStatus, next: ContractStatus) {
  if (current === next) return true;
  return transitions[current].includes(next);
}

export function transitionStatus(current: ContractStatus, next: ContractStatus) {
  if (!canTransition(current, next)) {
    const error = new Error(`Invalid transition from ${current} to ${next}`);
    (error as any).code = 'STATUS_INVALID';
    throw error;
  }
  return next;
}

export function computeNightlyStatus(status: ContractStatus, endAt?: Date | null) {
  if (!endAt) return status;
  if (status === ContractStatus.SIGNED || status === ContractStatus.CANCELLED) {
    return status;
  }
  if (endAt.getTime() < Date.now()) {
    return ContractStatus.EXPIRED;
  }
  return status;
}
