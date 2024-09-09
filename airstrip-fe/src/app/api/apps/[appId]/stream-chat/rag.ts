import { OPENAI_EMBEDDING_API_KEY } from '@/constants';
import { listAppKbSources } from '@/services/knowledge-base';
import { getDb } from '@/utils/backend/drizzle';
import { kbEmbeddings } from '@/utils/backend/drizzle/schema';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';
import { and, cosineDistance, desc, gt, inArray, sql } from 'drizzle-orm';

const openai = createOpenAI({
  apiKey: OPENAI_EMBEDDING_API_KEY,
});

export async function getRagContextPrompt(appId: string, userQuery: string) {
  if (!OPENAI_EMBEDDING_API_KEY) {
    return '';
  }

  const db = await getDb();

  const appKbSources = await listAppKbSources(appId);
  const kbSourceIds = appKbSources.map((appKbSource) => appKbSource.kbSourceId);

  if (!kbSourceIds.length) {
    return '';
  }

  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: userQuery,
  });

  const similarity = sql<number>`1 - (${cosineDistance(kbEmbeddings.embedding, embedding)})`;

  const relevantSources = await db
    .select({ content: kbEmbeddings.content, similarity })
    .from(kbEmbeddings)
    .where(
      and(gt(similarity, 0.3), inArray(kbEmbeddings.sourceId, kbSourceIds)),
    )
    .orderBy((t) => desc(t.similarity))
    .limit(10);

  const contentArr = relevantSources.map(({ content }) => `- ${content}`);

  return contentArr.length
    ? `
Check the following items from the knowledge base that might be usable in your response:
${contentArr.join('\n')}
`.trim()
    : '';
}
