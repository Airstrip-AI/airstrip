import { UserRole } from '@/utils/backend/client/common/types';

/**
 * The order of the roles is important. Lower index means higher role.
 */
export const UserRoleOrder: { [key in UserRole]: number } = {
  [UserRole.OWNER]: 0,
  [UserRole.ADMIN]: 1,
  [UserRole.MEMBER]: 2,
};

export function isAdminOrAbove(role: UserRole): boolean {
  return UserRoleOrder[role] <= UserRoleOrder[UserRole.ADMIN];
}
