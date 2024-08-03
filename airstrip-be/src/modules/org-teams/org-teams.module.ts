import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgTeamEntity } from '../org-teams/org-team.entity';
import { OrgTeamUserEntity } from '../org-teams/org-team-user.entity';
import { OrgTeamsService } from './org-teams.service';
import { OrgTeamsController } from './org-teams.controller';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrgTeamEntity, OrgTeamUserEntity]),
    OrgsModule,
  ],
  providers: [OrgTeamsService],
  exports: [OrgTeamsService],
  controllers: [OrgTeamsController],
})
export class OrgTeamsModule {}
