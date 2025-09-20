import {Role} from '@prisma/client';

const hierarchy: Record<Role, number> = {
  [Role.VIEWER]: 0,
  [Role.MEMBER]: 1,
  [Role.ADMIN]: 2,
  [Role.OWNER]: 3
};

export type Permission =
  | 'contracts:read'
  | 'contracts:write'
  | 'contracts:sign'
  | 'templates:manage'
  | 'team:manage'
  | 'billing:manage';

const rolePermissions: Record<Role, Permission[]> = {
  [Role.VIEWER]: ['contracts:read'],
  [Role.MEMBER]: ['contracts:read', 'contracts:write'],
  [Role.ADMIN]: [
    'contracts:read',
    'contracts:write',
    'contracts:sign',
    'templates:manage',
    'team:manage'
  ],
  [Role.OWNER]: [
    'contracts:read',
    'contracts:write',
    'contracts:sign',
    'templates:manage',
    'team:manage',
    'billing:manage'
  ]
};

export function hasRole(role: Role | null | undefined, atLeast: Role) {
  if (!role) return false;
  return hierarchy[role] >= hierarchy[atLeast];
}

export function hasPermission(role: Role | null | undefined, permission: Permission) {
  if (!role) return false;
  return rolePermissions[role].includes(permission);
}

export function assertPermission(role: Role | null | undefined, permission: Permission) {
  if (!hasPermission(role, permission)) {
    const error = new Error('Not authorized');
    (error as any).code = 'RBAC_FORBIDDEN';
    throw error;
  }
}

export function roleLabel(role: Role) {
  switch (role) {
    case Role.OWNER:
      return 'Owner';
    case Role.ADMIN:
      return 'Admin';
    case Role.MEMBER:
      return 'Member';
    case Role.VIEWER:
      return 'Viewer';
    default:
      return role;
  }
}
