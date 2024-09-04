import { Module } from '@nestjs/common';
import {
  ENCRYPTION_SERVICE_CONFIG,
  EncryptionService,
  EncryptionServiceConfig,
} from './encryption.service';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../../utils/constants/env';
import { boolean } from 'boolean';
import { InfisicalClient } from '@infisical/sdk';

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: ENCRYPTION_SERVICE_CONFIG,
      useFactory: (configService: ConfigService): EncryptionServiceConfig => {
        const useInfisicalForEncKey = boolean(
          configService.get<string>(
            EnvVariables.AIRSTRIP_USE_INFISICAL_FOR_ENCKEY,
          ),
        );
        if (!useInfisicalForEncKey) {
          return {
            encryptionKey: configService.getOrThrow<string>(
              EnvVariables.AIRSTRIP_ENCRYPTION_KEY,
            ),
          };
        } else {
          return {
            infisical: {
              client: new InfisicalClient({
                siteUrl:
                  configService.get<string>(
                    EnvVariables.AIRSTRIP_INFISICAL_API_URL,
                  ) || 'https://app.infisical.com',
                cacheTtl: 600, // increase cacheTtl from default of 5mins to 10mins since this shouldn't change often
                auth: {
                  universalAuth: {
                    clientId: configService.getOrThrow<string>(
                      EnvVariables.AIRSTRIP_INFISICAL_CLIENT_ID,
                    ),
                    clientSecret: configService.getOrThrow<string>(
                      EnvVariables.AIRSTRIP_INFISICAL_CLIENT_SECRET,
                    ),
                  },
                },
              }),
              projectId: configService.getOrThrow<string>(
                EnvVariables.AIRSTRIP_INFISICAL_PROJECT_ID,
              ),
              environment:
                configService.get<string>(
                  EnvVariables.AIRSTRIP_INFISICAL_PROJECT_ENV,
                ) || 'prod',
              secretName: configService.getOrThrow<string>(
                EnvVariables.AIRSTRIP_INFISICAL_SECRET_NAME,
              ),
              path:
                configService.get<string>(
                  EnvVariables.AIRSTRIP_INFISICAL_SECRET_PATH,
                ) || '/',
              type:
                configService.get<string>(
                  EnvVariables.AIRSTRIP_INFISICAL_SECRET_TYPE,
                ) || 'shared',
            },
          };
        }
      },
    },
    EncryptionService,
  ],
  exports: [EncryptionService],
})
export class EncryptionModule {}
