import { IsBoolean, IsString } from 'class-validator';
import { OrgInvite } from '../../org-invites/types/api';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptOrRejectInviteReq {
  @IsString()
  @ApiProperty()
  token: string;

  @IsBoolean()
  @ApiProperty()
  accept: boolean;
}

export class UserOrgInvite extends OrgInvite {
  @ApiProperty()
  token: string;
}

export class GetPendingUserOrgInvitesResp {
  @ApiProperty({ type: [UserOrgInvite] })
  data: UserOrgInvite[];
}
