import {
  AIRSTRIP_DB_HOST,
  AIRSTRIP_DB_NAME,
  AIRSTRIP_DB_PASSWORD,
  AIRSTRIP_DB_PORT,
  AIRSTRIP_DB_USER,
} from '@/constants';
import { config } from 'dotenv';
import { Config, defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  schema: './src/utils/backend/drizzle/schema.ts',
  out: './src/utils/backend/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: AIRSTRIP_DB_HOST,
    database: AIRSTRIP_DB_NAME,
    user: AIRSTRIP_DB_USER,
    password: AIRSTRIP_DB_PASSWORD,
    port: AIRSTRIP_DB_PORT,
  },
}) satisfies Config;
