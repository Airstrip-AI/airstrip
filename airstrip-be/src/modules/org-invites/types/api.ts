import { IsArray, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../../utils/constants';
import { ApiProperty } from '@nestjs/swagger';

export class OrgInvitesReq {
  @IsArray()
  @IsEmail({}, { each: true })
  @ApiProperty({ type: [String] })
  emails: string[];

  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;
}

export class OrgInvite {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  sentAt: Date;

  @ApiProperty()
  orgName: string;
}

export class GetPendingOrgInvitesResp {
  @ApiProperty({ type: [OrgInvite] })
  data: OrgInvite[];

  @ApiProperty()
  nextPageCursor: string | null;
}
