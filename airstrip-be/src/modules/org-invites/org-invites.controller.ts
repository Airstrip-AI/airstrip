import {
  Controller,
  Post,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Param,
  Body,
  Get,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GetPendingOrgInvitesResp, OrgInvitesReq } from './types/api';
import { OrgInvitesService } from './org-invites.service';
import { orgInviteEntityToOrgInvite } from './utils';
import { AuthedRequest } from '../auth/types/service';
import { ApiResponse } from '@nestjs/swagger';
import { MessageResp } from '../../utils/common';
import { OrgsGuard } from '../orgs/orgs.guard';
import { UserRole } from '../../utils/constants';
import { OrgInvitesGuard } from './org-invites.guard';

@Controller()
export class OrgInvitesController {
  constructor(private readonly orgInvitesService: OrgInvitesService) {}

  @Post('orgs/:orgId/org-invites')
  @UseGuards(OrgsGuard(UserRole.ADMIN))
  @ApiResponse({ status: '2XX', type: MessageResp })
  async inviteUsersToOrg(
    @Request() request: AuthedRequest,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() orgInvitesReq: OrgInvitesReq,
  ): Promise<MessageResp> {
    await this.orgInvitesService.inviteUsersToOrg(
      request.user.id,
      orgId,
      orgInvitesReq,
    );
    return {
      message: 'Invites sent successfully',
    };
  }

  @Get('orgs/:orgId/org-invites/pending')
  @UseGuards(OrgsGuard(UserRole.ADMIN))
  @ApiResponse({ status: '2XX', type: GetPendingOrgInvitesResp })
  async getPendingOrgInvites(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('page', ParseIntPipe) page: number = 0,
  ): Promise<GetPendingOrgInvitesResp> {
    const pendingInvitesPage =
      await this.orgInvitesService.getPendingOrgInvites(orgId, page);
    return {
      data: pendingInvitesPage.data.map(orgInviteEntityToOrgInvite),
      nextPageCursor: pendingInvitesPage.nextPageCursor,
    };
  }

  @Delete('org-invites/:orgInviteId')
  @UseGuards(OrgInvitesGuard(UserRole.ADMIN))
  @ApiResponse({ status: '2XX', type: MessageResp })
  async cancelOrgInvite(
    @Param('orgInviteId', ParseUUIDPipe) orgInviteId: string,
  ): Promise<MessageResp> {
    await this.orgInvitesService.cancelOrgInvite(orgInviteId);

    return {
      message: 'Invite cancelled successfully',
    };
  }
}
