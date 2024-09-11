import { createClient } from '@clickhouse/client';
import { NodeClickHouseClient } from '@clickhouse/client/dist/client';
import {
  CLICKHOUSE_DB,
  CLICKHOUSE_HOST,
  CLICKHOUSE_PASSWORD,
  CLICKHOUSE_USER,
} from '../../../constants';

let chClient: NodeClickHouseClient;

export function getClickhouseClient() {
  if (!chClient) {
    chClient = createClient({
      url: CLICKHOUSE_HOST,
      username: CLICKHOUSE_USER,
      password: CLICKHOUSE_PASSWORD,
      database: CLICKHOUSE_DB,
    });
  }

  return chClient;
}
