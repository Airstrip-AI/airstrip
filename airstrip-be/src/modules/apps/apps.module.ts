import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppEntity } from './app.entity';
import { OrgTeamsModule } from '../org-teams/org-teams.module';
import { OrgsModule } from '../orgs/orgs.module';
import { AiIntegrationsModule } from '../ai-integrations/ai-integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppEntity]),
    OrgTeamsModule,
    OrgsModule,
    AiIntegrationsModule,
  ],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
