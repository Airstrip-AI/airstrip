import {
  AIRSTRIP_DB_HOST,
  AIRSTRIP_DB_NAME,
  AIRSTRIP_DB_PASSWORD,
  AIRSTRIP_DB_PORT,
  AIRSTRIP_DB_SSL_CERT,
  AIRSTRIP_DB_USER,
} from '@/constants';
import { config } from 'dotenv';
import { Config, defineConfig } from 'drizzle-kit';

config();

export default defineConfig({
  schema: './src/utils/backend/drizzle/schema.ts',
  out: './src/utils/backend/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: AIRSTRIP_DB_HOST,
    database: AIRSTRIP_DB_NAME,
    user: AIRSTRIP_DB_USER,
    password: AIRSTRIP_DB_PASSWORD,
    port: AIRSTRIP_DB_PORT,
    ssl: AIRSTRIP_DB_SSL_CERT
      ? {
          rejectUnauthorized: true,
          ca: AIRSTRIP_DB_SSL_CERT,
        }
      : false,
  },
  schemaFilter: 'airstrip',
  migrations: {
    schema: 'airstrip',
  },
}) satisfies Config;
