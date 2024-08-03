import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from './organization.entity';
import { OrgsController } from './orgs.controller';
import { OrgsService } from './orgs.service';
import { OrgUserEntity } from './org-user.entity';
import { UserEntity } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity, OrgUserEntity, UserEntity]),
  ],
  controllers: [OrgsController],
  providers: [OrgsService],
  exports: [OrgsService],
})
export class OrgsModule {}
