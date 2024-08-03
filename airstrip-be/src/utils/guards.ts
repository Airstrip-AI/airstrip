import { UserRole, UserRoleOrder } from './constants';

export type AllowedMinimumRole = UserRole | '*';

export function isUserRoleAllowed(
  role: UserRole,
  minimumRoleAllowed: AllowedMinimumRole,
): boolean {
  if (minimumRoleAllowed === '*') {
    return true;
  }

  return UserRoleOrder[role] <= UserRoleOrder[minimumRoleAllowed];
}
