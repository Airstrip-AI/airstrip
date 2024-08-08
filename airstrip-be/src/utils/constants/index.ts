import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * The order of the roles is important. Lower index means higher role.
 */
export const UserRoleOrder: { [key in UserRole]: number } = {
  [UserRole.OWNER]: 0,
  [UserRole.ADMIN]: 1,
  [UserRole.MEMBER]: 2,
};

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const PRODUCT_NAME = 'Airstrip';

export function isAdminOrAbove(role: UserRole): boolean {
  return UserRoleOrder[role] <= UserRoleOrder[UserRole.ADMIN];
}
