import { Body, Controller, Get, Put, Request } from '@nestjs/common';
import { UserOrgInvitesService } from './user-org-invites.service';
import { orgInviteEntityToOrgInvite } from '../org-invites/utils';
import {
  AcceptOrRejectInviteReq,
  GetPendingUserOrgInvitesResp,
} from './types/api';
import { AuthedRequest } from '../auth/types/service';
import { ApiResponse } from '@nestjs/swagger';
import { MessageResp } from '../../utils/common';

@Controller('user-org-invites')
export class UserOrgInvitesController {
  constructor(private readonly userOrgInvitesService: UserOrgInvitesService) {}

  @Get()
  @ApiResponse({ status: '2XX', type: GetPendingUserOrgInvitesResp })
  async getPendingOrgInvitesForUser(
    @Request() request: AuthedRequest,
  ): Promise<GetPendingUserOrgInvitesResp> {
    const userInvites =
      await this.userOrgInvitesService.getPendingOrgInvitesForUser(
        request.user.email,
      );
    return {
      data: userInvites.map((invite) => ({
        ...orgInviteEntityToOrgInvite(invite),
        token: invite.token,
      })),
    };
  }

  @Put()
  @ApiResponse({ status: '2XX', type: MessageResp })
  async acceptOrRejectOrgInvite(
    @Request() request: AuthedRequest,
    @Body() acceptOrRejectInviteReq: AcceptOrRejectInviteReq,
  ): Promise<MessageResp> {
    await this.userOrgInvitesService.acceptOrRejectOrgInvite(
      acceptOrRejectInviteReq.token,
      request.user,
      acceptOrRejectInviteReq.accept,
    );

    return {
      message: `Invite ${acceptOrRejectInviteReq.accept ? 'accepted' : 'rejected'}`,
    };
  }
}
