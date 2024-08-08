import { IsArray, IsEnum, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../../../utils/constants';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrgTeamReq {
  @IsString()
  @ApiProperty()
  name: string;
}

export class AddOrgTeamUsersReq {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;
}

export class ChangeOrgTeamUserRoleReq {
  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;
}

export class OrgTeamResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  authedUserRole: UserRole | null;

  @ApiProperty()
  numMembers: number;
}

export class GetOrgTeamsResp {
  @ApiProperty({ type: [OrgTeamResp] })
  data: OrgTeamResp[];

  @ApiProperty()
  nextPageCursor: string | null;
}

export class OrgTeamUserResp {
  @ApiProperty()
  orgTeamId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userFirstName: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  orgId: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  joinedTeamAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetOrgTeamUsersResp {
  @ApiProperty({ type: [OrgTeamUserResp] })
  data: OrgTeamUserResp[];

  @ApiProperty()
  nextPageCursor: string | null;
}

export class OrgUserAndTeamMembershipResp {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  joinedOrgAt: Date;

  /**
   * The user's role in the team that was in the query.
   * If the user is not in the team, this will be null.
   */
  @ApiProperty()
  teamRole: UserRole | null;
}

export class GetOrgUserAndTeamMembershipResp {
  @ApiProperty({ type: [OrgUserAndTeamMembershipResp] })
  data: OrgUserAndTeamMembershipResp[];

  @ApiProperty()
  nextPageCursor: string | null;
}

export class UserOrgTeamResp {
  @ApiProperty()
  teamId: string;

  @ApiProperty()
  orgId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  name: string;
}

export class GetUserOrgTeamsResp {
  @ApiProperty({ type: [UserOrgTeamResp] })
  data: UserOrgTeamResp[];
}
