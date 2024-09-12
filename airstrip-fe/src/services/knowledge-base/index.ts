'use server';

import {
  BLOB_STORAGE_ACCESS_ID,
  BLOB_STORAGE_ACCESS_KEY,
  BLOB_STORAGE_BUCKET,
  BLOB_STORAGE_REGION,
  BLOB_STORAGE_URL,
  kbDocumentMaxSize,
  OPENAI_EMBEDDING_API_KEY,
} from '@/constants';
import { getDb } from '@/utils/backend/drizzle';
import { appKbSources, kbSources } from '@/utils/backend/drizzle/schema';
import { makePostRequest } from '@/utils/backend/utils';
import * as AWS from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { and, eq, notInArray } from 'drizzle-orm';
import { v4 } from 'uuid';
import { CreateKbEmbeddingReq, CreateKbEmbeddingResp } from './types';

const client = new AWS.S3({
  endpoint: BLOB_STORAGE_URL || undefined,
  region: BLOB_STORAGE_REGION,
  credentials: {
    accessKeyId: BLOB_STORAGE_ACCESS_ID,
    secretAccessKey: BLOB_STORAGE_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const docUploadPrefix = 'kb/docs';

export async function getDocUploadPresignedUrl({
  filename,
  contentType,
  size,
}: {
  filename: string;
  contentType: string;
  size: number;
}) {
  if (size > kbDocumentMaxSize) {
    throw new Error('File too large');
  }

  const blobKey = `${docUploadPrefix}/${v4()}`;

  const command = new AWS.PutObjectCommand({
    Bucket: BLOB_STORAGE_BUCKET,
    Metadata: {
      filename,
      contentType,
    },
    ContentLength: size,
    Key: blobKey,
  });

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return {
    signedUrl,
    blobKey,
  };
}

export async function createKbSource(
  authToken: string,
  {
    orgId,
    name,
    blobKey,
    contentType,
    size,
  }: {
    orgId: string;
    name: string;
    blobKey: string;
    contentType: string;
    size: number;
  },
) {
  const db = await getDb();

  const kbSource = await db
    .insert(kbSources)
    .values({
      orgId,
      blobKey,
      name,
      contentType,
      size,
    })
    .returning();

  const sourceId = kbSource[0]?.id;

  if (!sourceId) {
    throw new Error('Failed to create KB source');
  }

  await triggerEmbedding({
    authToken,
    sourceId,
    body: {
      bucket: BLOB_STORAGE_BUCKET,
      embeddingApiKey: OPENAI_EMBEDDING_API_KEY,
    },
  });

  return;
}

async function triggerEmbedding({
  authToken,
  sourceId,
  body,
}: {
  authToken: string;
  sourceId: string;
  body: CreateKbEmbeddingReq;
}) {
  return makePostRequest<CreateKbEmbeddingReq, CreateKbEmbeddingResp>({
    endpoint: `/api/v1/knowledge-base/${sourceId}/embeddings`,
    authToken,
    body,
  });
}

export async function listKbSources(orgId: string) {
  const db = await getDb();

  return db.query.kbSources.findMany({
    where: eq(kbSources.orgId, orgId),
  });
}

export async function listAppKbSources(appId: string) {
  const db = await getDb();

  return db.query.appKbSources.findMany({
    where: eq(appKbSources.appId, appId),
    with: {
      sourceData: true,
    },
  });
}

export async function saveAppKbSources({
  appId,
  sourceIds,
}: {
  appId: string;
  sourceIds: string[];
}) {
  const db = await getDb();

  await db
    .delete(appKbSources)
    .where(
      and(
        notInArray(appKbSources.kbSourceId, sourceIds),
        eq(appKbSources.appId, appId),
      ),
    );

  if (sourceIds.length) {
    await db
      .insert(appKbSources)
      .values(
        sourceIds.map((sourceId) => ({
          appId,
          kbSourceId: sourceId,
        })),
      )
      .onConflictDoNothing();
  }
}
