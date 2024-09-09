import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvVariables } from '../../utils/constants/env';
import { KbEmbeddingsController } from './kb-embeddings.controller';
import { KbEmbeddingEntity } from './kb-embeddings.entity';
import {
  KB_EMBEDDING_SERVICE_CONFIG,
  KbEmbeddingServiceConfig,
  KbEmbeddingsService,
} from './kb-embeddings.service';
import { KbSourceEntity } from './kb-sources.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KbEmbeddingEntity, KbSourceEntity])],
  controllers: [KbEmbeddingsController],
  providers: [
    {
      inject: [ConfigService],
      provide: KB_EMBEDDING_SERVICE_CONFIG,
      useFactory: (configService: ConfigService): KbEmbeddingServiceConfig => {
        return {
          blobStorage: {
            url:
              configService.get<string>(
                EnvVariables.AIRSTRIP_BLOB_STORAGE_URL,
              ) || undefined,
            accessId:
              configService.get<string>(
                EnvVariables.AIRSTRIP_BLOB_STORAGE_ACCESS_ID,
              ) || '',
            accessKey:
              configService.get<string>(
                EnvVariables.AIRSTRIP_BLOB_STORAGE_ACCESS_KEY,
              ) || '',
            region:
              configService.get<string>(
                EnvVariables.AIRSTRIP_BLOB_STORAGE_REGION,
              ) || '',
          },
          unstructured: {
            url:
              configService.get<string>(
                EnvVariables.AIRSTRIP_UNSTRUCTURED_IO_URL,
              ) || undefined,
            apiKey:
              configService.get<string>(
                EnvVariables.AIRSTRIP_UNSTRUCTURED_IO_API_KEY,
              ) || '',
          },
        };
      },
    },
    KbEmbeddingsService,
  ],
  exports: [KbEmbeddingsService],
})
export class KbEmbeddingsModule {}
