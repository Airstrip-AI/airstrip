import { Module } from '@nestjs/common';
import { UserOrgInvitesController } from './user-org-invites.controller';
import { UserOrgInvitesService } from './user-org-invites.service';
import { OrgInvitesModule } from '../org-invites/org-invites.module';

@Module({
  imports: [OrgInvitesModule],
  controllers: [UserOrgInvitesController],
  providers: [UserOrgInvitesService],
})
export class UserOrgInvitesModule {}
