import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
  Request,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { ChangeUserRoleReq, GetUsersInOrgResp, OrgUserResp } from './types/api';
import { OrganizationUserWithUser } from './types/service';
import { ApiResponse } from '@nestjs/swagger';
import { AuthedRequest } from '../auth/types/service';
import { MessageResp } from '../../utils/common';
import { OrgsAdminGuard, OrgsMemberGuard } from './orgs.guard';

@Controller('orgs')
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Get(':orgId/users')
  @UseGuards(OrgsMemberGuard)
  @ApiResponse({ status: '2XX', type: GetUsersInOrgResp })
  async getUsersInOrg(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('page', ParseIntPipe) page: number = 0,
  ): Promise<GetUsersInOrgResp> {
    const usersInOrgPage = await this.orgsService.getUsersInOrg(orgId, page);

    return {
      data: usersInOrgPage.data.map(this.orgUserEntityToOrgUserResp),
      total: usersInOrgPage.total,
      nextPageCursor: usersInOrgPage.nextPageCursor,
    };
  }

  @Put(':orgId/users/:userId/change-role')
  @UseGuards(OrgsAdminGuard)
  @ApiResponse({ status: '2XX', type: MessageResp })
  async changeUserRole(
    @Request() request: AuthedRequest,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() changeUserRoleReq: ChangeUserRoleReq,
  ): Promise<MessageResp> {
    if (request.user.id === userId) {
      throw new BadRequestException('Cannot change your own role');
    }

    await this.orgsService.changeUserRole(
      request.user,
      orgId,
      userId,
      changeUserRoleReq.role,
    );

    return {
      message: 'User role changed successfully',
    };
  }

  // Not implementing remove user from org and delete user account first because there are considerations like handling
  // data created by the user. Will spec that out once we have a better understanding of the requirements.

  private orgUserEntityToOrgUserResp(
    orgUserWithUser: OrganizationUserWithUser,
  ): OrgUserResp {
    return {
      id: orgUserWithUser.user.id,
      email: orgUserWithUser.user.email,
      firstName: orgUserWithUser.user.firstName,
      joinedOrgAt: orgUserWithUser.joinedOrgAt,
      role: orgUserWithUser.role,
    };
  }
}
