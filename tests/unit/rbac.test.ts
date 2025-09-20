import {describe, expect, it} from 'vitest';
import {Role} from '@prisma/client';
import {hasPermission, hasRole} from '@/lib/rbac';

describe('rbac', () => {
  it('validates role hierarchy', () => {
    expect(hasRole(Role.ADMIN, Role.MEMBER)).toBe(true);
    expect(hasRole(Role.MEMBER, Role.ADMIN)).toBe(false);
  });

  it('checks permissions by role', () => {
    expect(hasPermission(Role.VIEWER, 'contracts:read')).toBe(true);
    expect(hasPermission(Role.VIEWER, 'contracts:write')).toBe(false);
    expect(hasPermission(Role.OWNER, 'billing:manage')).toBe(true);
  });
});
