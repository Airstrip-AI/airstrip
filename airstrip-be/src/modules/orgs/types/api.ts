import { IsEnum } from 'class-validator';
import { UserRole } from '../../../utils/constants';
import { ApiProperty } from '@nestjs/swagger';

export class OrgResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrgUserResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  joinedOrgAt: Date;

  @ApiProperty()
  role: UserRole;
}

export class GetUsersInOrgResp {
  @ApiProperty({ type: [OrgUserResp] })
  data: OrgUserResp[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  nextPageCursor: string | null;
}

export class ChangeUserRoleReq {
  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;
}
