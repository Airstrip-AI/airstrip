import {
  AIRSTRIP_DB_HOST,
  AIRSTRIP_DB_NAME,
  AIRSTRIP_DB_PASSWORD,
  AIRSTRIP_DB_PORT,
  AIRSTRIP_DB_USER,
} from '@/constants';
import {} from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

import * as schema from '@/utils/backend/drizzle/schema';

const clientConfig = {
  host: AIRSTRIP_DB_HOST,
  port: AIRSTRIP_DB_PORT,
  user: AIRSTRIP_DB_USER,
  password: AIRSTRIP_DB_PASSWORD,
  database: AIRSTRIP_DB_NAME,
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
