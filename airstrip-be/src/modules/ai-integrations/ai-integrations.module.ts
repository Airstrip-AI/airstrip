import { Module } from '@nestjs/common';
import { AiIntegrationsController } from './ai-integrations.controller';
import {
  AI_INTEGRATIONS_SERVICE_CONFIG,
  AiIntegrationsService,
  AiIntegrationsServiceConfig,
} from './ai-integrations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiIntegrationEntity } from './ai-integration.entity';
import { OrgTeamsModule } from '../org-teams/org-teams.module';
import { OrgsModule } from '../orgs/orgs.module';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../../utils/constants/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiIntegrationEntity]),
    OrgTeamsModule,
    OrgsModule,
  ],
  controllers: [AiIntegrationsController],
  providers: [
    {
      provide: AI_INTEGRATIONS_SERVICE_CONFIG,
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): AiIntegrationsServiceConfig => ({
        infisicalApiUrl:
          configService.get(EnvVariables.AIRSTRIP_INFISICAL_API_URL) ||
          'https://app.infisical.com',
        infisicalClientId: configService.getOrThrow(
          EnvVariables.AIRSTRIP_INFISICAL_CLIENT_ID,
        ),
        infisicalClientSecret: configService.getOrThrow(
          EnvVariables.AIRSTRIP_INFISICAL_CLIENT_SECRET,
        ),
        infisicalProjectId: configService.getOrThrow(
          EnvVariables.AIRSTRIP_INFISICAL_PROJECT_ID,
        ),
        infisicalEnvironment: configService.getOrThrow(
          EnvVariables.AIRSTRIP_INFISICAL_PROJECT_ENV,
        ),
      }),
    },
    AiIntegrationsService,
  ],
  exports: [AiIntegrationsService],
})
export class AiIntegrationsModule {}
