import {Plan, SignatureProvider} from '@prisma/client';

type PlanConfig = {
  name: string;
  monthlyPrice: number;
  userLimit: number;
  activeContractLimit: number;
  allowedProviders: SignatureProvider[];
  description: string;
};

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  [Plan.FREE]: {
    name: 'Free',
    monthlyPrice: 0,
    userLimit: 1,
    activeContractLimit: 5,
    allowedProviders: [SignatureProvider.MANUAL],
    description: 'Ideal for individuals testing Signloop.'
  },
  [Plan.STARTER]: {
    name: 'Starter',
    monthlyPrice: 39,
    userLimit: 5,
    activeContractLimit: 100,
    allowedProviders: [SignatureProvider.MANUAL, SignatureProvider.EGUVEN, SignatureProvider.TURKTRUST],
    description: 'Growing teams who need provider integrations.'
  },
  [Plan.PRO]: {
    name: 'Pro',
    monthlyPrice: 99,
    userLimit: 20,
    activeContractLimit: Infinity,
    allowedProviders: [SignatureProvider.MANUAL, SignatureProvider.EGUVEN, SignatureProvider.TURKTRUST],
    description: 'Advanced workflows with unlimited contracts.'
  }
};

export function getPlanLimits(plan: Plan) {
  return PLAN_CONFIG[plan];
}

export function enforceContractLimit(plan: Plan, activeContracts: number) {
  const limit = PLAN_CONFIG[plan].activeContractLimit;
  if (limit !== Infinity && activeContracts >= limit) {
    const error = new Error('Contract limit reached for plan');
    (error as any).code = 'PLAN_CONTRACT_LIMIT';
    throw error;
  }
}

export function enforceUserLimit(plan: Plan, userCount: number) {
  const limit = PLAN_CONFIG[plan].userLimit;
  if (userCount > limit) {
    const error = new Error('User limit exceeded for plan');
    (error as any).code = 'PLAN_USER_LIMIT';
    throw error;
  }
}

export function providerAllowed(plan: Plan, provider: SignatureProvider) {
  return PLAN_CONFIG[plan].allowedProviders.includes(provider);
}
