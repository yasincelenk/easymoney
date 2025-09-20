import {describe, expect, it} from 'vitest';
import {Plan, SignatureProvider} from '@prisma/client';
import {enforceContractLimit, getPlanLimits, providerAllowed} from '@/lib/plans';

describe('plans', () => {
  it('returns plan limits', () => {
    const free = getPlanLimits(Plan.FREE);
    expect(free.userLimit).toBe(1);
  });

  it('enforces contract limit', () => {
    expect(() => enforceContractLimit(Plan.FREE, 4)).not.toThrow();
    expect(() => enforceContractLimit(Plan.FREE, 5)).toThrow();
  });

  it('checks provider availability', () => {
    expect(providerAllowed(Plan.FREE, SignatureProvider.MANUAL)).toBe(true);
    expect(providerAllowed(Plan.FREE, SignatureProvider.EGUVEN)).toBe(false);
  });
});
