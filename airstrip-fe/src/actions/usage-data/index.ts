'use server';

import { getClickhouseClient } from '@/utils/backend/clickhouse';
import { authGuard } from '../auth.guard';
import { makeChatOwnerGuard } from '../guards/chats.guard';
import dayjs from 'dayjs';
import { makeOrgsAdminGuard } from '@/actions/guards/orgs.guard';
import { ResultSet } from '@clickhouse/client';

export async function saveMessageUsageData(usageData: {
  chatMessageId: string;
  createdAt: Date;
  orgId: string;
  appId: string;
  userId: string;
  chatId: string;
  aiProvider: string;
  aiModel: string;
  completionTokens: number | null;
  promptTokens: number | null;
  totalTokens: number | null;
  status: string | null;
}) {
  await authGuard([makeChatOwnerGuard(usageData.chatId)]);

  const chClient = getClickhouseClient();

  await chClient.insert({
    table: 'responses',
    values: [
      {
        chat_message_id: usageData.chatMessageId,
        created_at: dayjs(usageData.createdAt).format(
          'YYYY-MM-DD HH:mm:ss.SSS',
        ),
        org_id: usageData.orgId,
        app_id: usageData.appId,
        user_id: usageData.userId,
        chat_id: usageData.chatId,
        ai_provider: usageData.aiProvider,
        ai_model: usageData.aiModel,
        completion_tokens: usageData.completionTokens,
        prompt_tokens: usageData.promptTokens,
        total_tokens: usageData.totalTokens,
        status: usageData.status,
      },
    ],
    format: 'JSONEachRow',
  });

  return {
    message: 'ok',
  };
}

export type OrgModelUsageData = {
  ai_model: string;
  num_requests: number;
  total_tokens: number;
  avgPromptTokensPerReq: number;
  avgCompletionTokensPerReq: number;
  avgTotalTokensPerReq: number;
  dailyStatsLastWeek: {
    day: string;
    num_requests: number;
  }[];
};

export async function getOrgModelsUsed(orgId: string): Promise<string[]> {
  await authGuard([makeOrgsAdminGuard(orgId)]);

  const chClient = getClickhouseClient();

  let resultsSet: ResultSet<'JSONEachRow'>;

  const query_params = {
    orgId,
  };

  resultsSet = await chClient.query({
    query: `SELECT DISTINCT ai_model FROM responses WHERE org_id = {orgId: String}`,
    query_params,
    format: 'JSONEachRow',
  });

  return (await resultsSet.json()).map((row: any) => row.ai_model as string);
}

export async function getOrgModelUsageData(
  orgId: string,
  modelName: string,
): Promise<OrgModelUsageData> {
  await authGuard([makeOrgsAdminGuard(orgId)]);

  const chClient = getClickhouseClient();

  let resultsSet: ResultSet<'JSONEachRow'>;

  const query_params = {
    orgId,
    modelName,
  };

  resultsSet = await chClient.query({
    query: `SELECT
    AVG(prompt_tokens) AS avg_prompt_tokens,
    AVG(completion_tokens) AS avg_completion_tokens,
    AVG(total_tokens) AS avg_total_tokens
    FROM responses WHERE org_id = {orgId: String} AND ai_model = {modelName: String}`,
    query_params,
    format: 'JSONEachRow',
  });
  const averages = (await resultsSet.json())[0] as {
    avg_prompt_tokens: number;
    avg_completion_tokens: number;
    avg_total_tokens: number;
  };

  resultsSet = await chClient.query({
    query: `SELECT ai_model, COUNT(*) AS num_requests, SUM(total_tokens) AS total_tokens
    FROM responses WHERE org_id = {orgId: String} AND ai_model = {modelName: String}
    GROUP BY ai_model`,
    query_params,
    format: 'JSONEachRow',
  });
  const modelStats = (await resultsSet.json()).map((row: any) => ({
    ai_model: row.ai_model as string,
    num_requests: parseInt(row.num_requests),
    total_tokens: parseInt(row.total_tokens),
  }));

  resultsSet = await chClient.query({
    query: `SELECT toDate(created_at) AS day, COUNT(*) AS num_requests
    FROM responses WHERE created_at >= toDate(now() - INTERVAL 7 DAY)
    AND org_id = {orgId: String} AND ai_model = {modelName: String}
    GROUP BY day ORDER BY day`,
    query_params,
    format: 'JSONEachRow',
  });
  const dailyStats = (await resultsSet.json()).map((row: any) => ({
    day: row.day,
    num_requests: parseInt(row.num_requests),
  }));

  const today = dayjs().startOf('day');
  for (let i = 6; i >= 0; i--) {
    const day = today.subtract(i, 'day').format('YYYY-MM-DD');
    if (!dailyStats.find((stat) => stat.day === day)) {
      dailyStats.push({ day, num_requests: 0 });
    }
  }

  dailyStats.sort((a, b) => a.day.localeCompare(b.day));

  return {
    ai_model: modelName,
    num_requests: modelStats[0]?.num_requests ?? 0,
    total_tokens: modelStats[0]?.total_tokens ?? 0,
    avgPromptTokensPerReq: Math.round(averages.avg_prompt_tokens),
    avgCompletionTokensPerReq: Math.round(averages.avg_completion_tokens),
    avgTotalTokensPerReq: Math.round(averages.avg_total_tokens),
    dailyStatsLastWeek: dailyStats,
  };
}
