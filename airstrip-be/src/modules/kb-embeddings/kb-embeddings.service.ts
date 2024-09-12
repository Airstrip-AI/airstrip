import { createOpenAI } from '@ai-sdk/openai';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { embedMany } from 'ai';
import { Repository } from 'typeorm';
import { UnstructuredClient } from 'unstructured-client';
import { ChunkingStrategy } from 'unstructured-client/sdk/models/shared/index.js';
import { KbEmbeddingEntity } from './kb-embeddings.entity';
import { KbSourceEntity } from './kb-sources.entity';
import { CreateKbEmbeddingDto, PartitionElement } from './types/service';

export const KB_EMBEDDING_SERVICE_CONFIG = 'KB_EMBEDDING_SERVICE_CONFIG';

export type KbEmbeddingServiceConfig = {
  blobStorage: {
    url?: string;
    region?: string;
    accessId: string;
    accessKey: string;
  };
  unstructured: {
    url?: string;
    apiKey: string;
  };
};

@Injectable()
export class KbEmbeddingsService {
  private blobStorageClient: S3;
  private unstructuredClient: UnstructuredClient;

  constructor(
    @InjectRepository(KbEmbeddingEntity)
    private readonly kbEmbeddingsRepository: Repository<KbEmbeddingEntity>,
    @InjectRepository(KbSourceEntity)
    private readonly kbSourceRepository: Repository<KbSourceEntity>,
    @Inject(KB_EMBEDDING_SERVICE_CONFIG)
    private readonly config: KbEmbeddingServiceConfig,
  ) {
    this.blobStorageClient = new S3({
      endpoint: this.config.blobStorage.url || undefined,
      region: this.config.blobStorage.region || 'us-east-1',
      credentials: {
        accessKeyId: this.config.blobStorage.accessId || '',
        secretAccessKey: this.config.blobStorage.accessKey || '',
      },
      forcePathStyle: true,
    });

    this.unstructuredClient = new UnstructuredClient({
      serverURL: this.config.unstructured.url,
      security: {
        apiKeyAuth: this.config.unstructured.apiKey,
      },
    });
  }

  async createKbEmbedding(
    kbSourceId: string,
    dto: CreateKbEmbeddingDto,
  ): Promise<{ ok: true }> {
    const kbSource = await this.kbSourceRepository.findOne({
      where: {
        id: kbSourceId,
      },
    });

    if (!kbSource) {
      throw new NotFoundException('Knowledge base source not found');
    }

    this.chunkAndMakeEmbeddingAsync(kbSourceId, {
      blobKey: kbSource.blobKey,
      bucket: dto.bucket,
      embeddingApiKey: dto.embeddingApiKey,
    });

    return {
      ok: true,
    };
  }

  private async chunkAndMakeEmbeddingAsync(
    kbSourceId: string,
    body: {
      blobKey: string;
      bucket: string;
      embeddingApiKey: string;
    },
  ) {
    const { blobKey, bucket, embeddingApiKey } = body;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: blobKey,
    });

    try {
      const getResult = await this.blobStorageClient.send(command);
      const contentType = getResult.ContentType;
      const name =
        getResult.Metadata?.filename || blobKey.split('/').pop() || 'file';
      const byteArr = await getResult.Body?.transformToByteArray();

      if (!byteArr) {
        throw new Error('blob content is empty');
      }

      const blob = new Blob([byteArr], { type: contentType });

      const chunks = await this.unstructuredClient.general.partition({
        partitionParameters: {
          files: {
            content: blob,
            fileName: name,
          },
          chunkingStrategy: ChunkingStrategy.ByTitle,
        },
      });

      const openai = createOpenAI({
        apiKey: embeddingApiKey,
      });

      const elements = (chunks.elements || []) as PartitionElement[];

      if (!elements.length) {
        throw new Error('no elements found');
      }

      const { embeddings } = await embedMany({
        values: elements.map((elm) => (elm as PartitionElement).text) || [],
        model: openai.embedding('text-embedding-3-small'),
      });

      const data: Partial<KbEmbeddingEntity>[] = elements.map((elm, i) => {
        const { text, metadata } = elm;
        const embedding = embeddings[i];

        return {
          sourceId: kbSourceId,
          embedding,
          content: text,
          metadata: {
            pageNumber: metadata.page_number,
          },
        };
      });

      await this.kbEmbeddingsRepository.save(data);
      await this.kbSourceRepository.update(kbSourceId, {
        processedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    }
  }
}
