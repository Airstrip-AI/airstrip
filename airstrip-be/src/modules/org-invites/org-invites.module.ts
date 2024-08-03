import { Module } from '@nestjs/common';
import {
  ORG_INVITES_SERVICE_CONFIG,
  OrgInvitesService,
  OrgInvitesServiceConfig,
} from './org-invites.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgInviteEntity } from './org-invite.entity';
import { OrgInvitesController } from './org-invites.controller';
import { OrgsModule } from '../orgs/orgs.module';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { OrganizationEntity } from '../orgs/organization.entity';
import { EnvVariables } from '../../utils/constants/env';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrgInviteEntity, OrganizationEntity]),
    EmailModule,
    OrgsModule,
  ],
  controllers: [OrgInvitesController],
  providers: [
    {
      provide: ORG_INVITES_SERVICE_CONFIG,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): OrgInvitesServiceConfig => ({
        frontendUrl: configService.getOrThrow<string>(
          EnvVariables.AIRSTRIP_FRONTEND_URL,
        ),
      }),
    },
    OrgInvitesService,
  ],
  exports: [OrgInvitesService],
})
export class OrgInvitesModule {}
