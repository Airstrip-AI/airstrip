import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrgTeamsService } from './org-teams.service';
import {
  CreateOrgTeamReq,
  OrgTeamEntityWithAuthedUserRoleAndNumMembers,
  OrgTeamUserWithUserJoined,
} from './types/service';
import { AuthedRequest } from '../auth/types/service';
import {
  AddOrgTeamUsersReq,
  ChangeOrgTeamUserRoleReq,
  GetOrgTeamsResp,
  GetOrgTeamUsersResp,
  GetOrgUserAndTeamMembershipResp,
  OrgTeamResp,
  OrgTeamUserResp,
} from './types/api';
import { OrgsGuard } from '../orgs/orgs.guard';
import { UserRole } from '../../utils/constants';
import { ApiResponse } from '@nestjs/swagger';
import { OrgTeamsGuard } from './org-teams.guard';
import { MessageResp } from '../../utils/common';

@Controller('org-teams')
export class OrgTeamsController {
  constructor(private readonly orgTeamsService: OrgTeamsService) {}

  @Post('orgs/:orgId')
  @UseGuards(OrgsGuard(UserRole.ADMIN))
  @ApiResponse({ status: '2XX', type: OrgTeamResp })
  async createTeam(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Request() request: AuthedRequest,
    @Body() createOrgTeamReq: CreateOrgTeamReq,
  ): Promise<OrgTeamResp> {
    const orgTeamEntity =
      await this.orgTeamsService.createOrgTeamAndAddUserAsOwner({
        orgId,
        name: createOrgTeamReq.name,
        creatorId: request.user.id,
      });

    return this.orgTeamEntityToResp(orgTeamEntity);
  }

  @Get('orgs/:orgId')
  @UseGuards(OrgsGuard('*'))
  @ApiResponse({ status: '2XX', type: GetOrgTeamsResp })
  async getOrgTeams(
    @Request() request: AuthedRequest,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<GetOrgTeamsResp> {
    const orgTeamsPage = await this.orgTeamsService.getOrgTeams(
      request.user,
      orgId,
      page,
    );

    return {
      data: orgTeamsPage.data.map(this.orgTeamEntityToResp),
      nextPageCursor: orgTeamsPage.nextPageCursor,
    };
  }

  @Get(':orgTeamId')
  @UseGuards(
    OrgTeamsGuard({
      teamMinimumRole: '*',
      orgMinimumRole: '*',
    }),
  )
  @ApiResponse({ status: '2XX', type: OrgTeamResp })
  async getOrgTeam(
    @Request() request: AuthedRequest,
    @Param('orgTeamId', ParseUUIDPipe) orgTeamId: string,
  ): Promise<OrgTeamResp> {
    const orgTeam =
      await this.orgTeamsService.getOrgTeamWithRoleAndNumMembersById(
        request.user,
        orgTeamId,
      );
    return this.orgTeamEntityToResp(orgTeam);
  }

  /**
   * This gets all users in an org and details on whether they are in the team pointed by orgTeamId.
   * Useful for populating a list of users to add to a team.
   */
  @Get(':orgTeamId/org-users')
  @UseGuards(
    OrgTeamsGuard({
      teamMinimumRole: '*',
      orgMinimumRole: UserRole.ADMIN,
    }),
  )
  @ApiResponse({ status: '2XX', type: GetOrgUserAndTeamMembershipResp })
  async getOrgUsersAndTeamMembershipDetails(
    @Param('orgTeamId', ParseUUIDPipe) orgTeamId: string,
    @Query('page', ParseIntPipe) page: number = 0,
    @Query('searchTerm') searchTerm?: string,
  ): Promise<GetOrgUserAndTeamMembershipResp> {
    const orgUsersPage =
      await this.orgTeamsService.getOrgUsersAndTeamMembershipDetails(
        orgTeamId,
        page,
        searchTerm,
      );

    return {
      data: orgUsersPage.data.map((orgUser) => ({
        id: orgUser.user.id,
        email: orgUser.user.email,
        firstName: orgUser.user.firstName,
        joinedOrgAt: orgUser.joinedOrgAt,
        teamRole: orgUser.teamRole,
      })),
      nextPageCursor: orgUsersPage.nextPageCursor,
    };
  }

  @Get(':orgTeamId/users')
  @UseGuards(
    OrgTeamsGuard({
      teamMinimumRole: '*',
      orgMinimumRole: UserRole.ADMIN,
    }),
  )
  @ApiResponse({ status: '2XX', type: GetOrgTeamUsersResp })
  async getOrgTeamUsers(
    @Param('orgTeamId', ParseUUIDPipe) orgTeamId: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<GetOrgTeamUsersResp> {
    const orgTeamUsersPage = await this.orgTeamsService.getOrgTeamUsers(
      orgTeamId,
      page,
    );

    return {
      data: orgTeamUsersPage.data.map(this.orgTeamUserWithUserEntityToResp),
      nextPageCursor: orgTeamUsersPage.nextPageCursor,
    };
  }

  @Post(':orgTeamId/users')
  @UseGuards(
    OrgTeamsGuard({
      teamMinimumRole: UserRole.ADMIN,
      orgMinimumRole: UserRole.ADMIN,
    }),
  )
  @ApiResponse({ status: '2XX', type: MessageResp })
  async addOrgTeamUsers(
    @Param('orgTeamId', ParseUUIDPipe) orgTeamId: string,
    @Body() addOrgTeamUsersReq: AddOrgTeamUsersReq,
  ): Promise<MessageResp> {
    await this.orgTeamsService.addUsersToOrgTeamByOrgTeamId(
      orgTeamId,
      addOrgTeamUsersReq.userIds,
      addOrgTeamUsersReq.role,
    );
    return {
      message: 'Users added to team successfully',
    };
  }

  @Put(':orgTeamId/users/change-role')
  @UseGuards(
    OrgTeamsGuard({
      teamMinimumRole: UserRole.ADMIN,
      orgMinimumRole: UserRole.ADMIN,
    }),
  )
  @ApiResponse({ status: '2XX', type: MessageResp })
  async changeOrgTeamUserRole(
    @Request() request: AuthedRequest,
    @Param('orgTeamId', ParseUUIDPipe) orgTeamId: string,
    @Body() changeOrgTeamUserRoleReq: ChangeOrgTeamUserRoleReq,
  ): Promise<MessageResp> {
    await this.orgTeamsService.changeOrgTeamUserRole(
      request.user,
      orgTeamId,
      changeOrgTeamUserRoleReq.userId,
      changeOrgTeamUserRoleReq.role,
    );
    return {
      message: 'User role changed successfully',
    };
  }

  private orgTeamEntityToResp(
    orgTeamEntity: OrgTeamEntityWithAuthedUserRoleAndNumMembers,
  ): OrgTeamResp {
    return {
      id: orgTeamEntity.id,
      name: orgTeamEntity.name,
      createdAt: orgTeamEntity.createdAt,
      updatedAt: orgTeamEntity.updatedAt,
      authedUserRole: orgTeamEntity.authedUserRole,
      numMembers: orgTeamEntity.numMembers,
    };
  }

  private orgTeamUserWithUserEntityToResp(
    orgTeamUserEntity: OrgTeamUserWithUserJoined,
  ): OrgTeamUserResp {
    return {
      orgTeamId: orgTeamUserEntity.orgTeamId,
      userId: orgTeamUserEntity.userId,
      userFirstName: orgTeamUserEntity.user.firstName,
      userEmail: orgTeamUserEntity.user.email,
      orgId: orgTeamUserEntity.orgId,
      role: orgTeamUserEntity.role,
      joinedTeamAt: orgTeamUserEntity.joinedTeamAt,
      updatedAt: orgTeamUserEntity.updatedAt,
    };
  }
}