import { Module } from '@nestjs/common';
import { AiIntegrationsController } from './ai-integrations.controller';
import { AiIntegrationsService } from './ai-integrations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiIntegrationEntity } from './ai-integration.entity';
import { OrgTeamsModule } from '../org-teams/org-teams.module';
import { OrgsModule } from '../orgs/orgs.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiIntegrationEntity]),
    OrgTeamsModule,
    OrgsModule,
    EncryptionModule,
  ],
  controllers: [AiIntegrationsController],
  providers: [AiIntegrationsService],
  exports: [AiIntegrationsService],
})
export class AiIntegrationsModule {}
