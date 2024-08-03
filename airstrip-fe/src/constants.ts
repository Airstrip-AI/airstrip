import { UserRole } from '@/utils/backend/client/common/types';

export const PRODUCT_NAME = 'Airstrip';

export const BE_API_HOST = process.env.NEXT_PUBLIC_BE_API_HOST;

export const roleColors = {
  [UserRole.OWNER]: 'red',
  [UserRole.ADMIN]: 'blue',
  [UserRole.MEMBER]: 'green',
};
