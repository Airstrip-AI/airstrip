import {
  AIRSTRIP_DB_HOST,
  AIRSTRIP_DB_NAME,
  AIRSTRIP_DB_PASSWORD,
  AIRSTRIP_DB_PORT,
  AIRSTRIP_DB_SSL_CERT,
  AIRSTRIP_DB_USER,
} from '@/constants';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client, ClientConfig } from 'pg';

import * as schema from '@/utils/backend/drizzle/combined';

const clientConfig: ClientConfig = {
  host: AIRSTRIP_DB_HOST,
  port: AIRSTRIP_DB_PORT,
  user: AIRSTRIP_DB_USER,
  password: AIRSTRIP_DB_PASSWORD,
  database: AIRSTRIP_DB_NAME,
  ssl: AIRSTRIP_DB_SSL_CERT
    ? {
        rejectUnauthorized: true,
        ca: AIRSTRIP_DB_SSL_CERT,
      }
    : false,
};

const configEntries = Object.entries(clientConfig);

for (const [key, value] of configEntries) {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const client = new Client(clientConfig);

let db: NodePgDatabase<typeof schema>;

export async function getDb() {
  if (!db) {
    await client.connect();
    db = drizzle(client, { schema });
  }

  return db;
}
