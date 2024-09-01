import { UserRole } from '@/utils/backend/client/common/types';

export const PRODUCT_NAME = 'Airstrip';
export const GITHUB_REPO_URL = 'https://github.com/Airstrip-AI/airstrip';

export const BE_API_HOST = process.env.NEXT_PUBLIC_BE_API_HOST;

export const roleColors = {
  [UserRole.OWNER]: 'red',
  [UserRole.ADMIN]: 'blue',
  [UserRole.MEMBER]: 'green',
};

export const AIRSTRIP_DB_HOST = process.env.AIRSTRIP_DB_HOST || 'localhost';
export const AIRSTRIP_DB_PORT = parseInt(
  process.env.AIRSTRIP_DB_PORT || '5432',
  10,
);
export const AIRSTRIP_DB_USER = process.env.AIRSTRIP_DB_USER || '';
export const AIRSTRIP_DB_PASSWORD = process.env.AIRSTRIP_DB_PASSWORD || '';
export const AIRSTRIP_DB_NAME = process.env.AIRSTRIP_DB_NAME || '';
export const AIRSTRIP_DB_SSL_CERT = process.env.AIRSTRIP_DB_SSL_CERT || '';

export const MEM0_API_KEY = process.env.MEM0_API_KEY || '';
