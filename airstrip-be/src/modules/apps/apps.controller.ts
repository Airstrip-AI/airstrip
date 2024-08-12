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
import { AppsService } from './apps.service';
import { ApiResponse } from '@nestjs/swagger';
import {
  AppResp,
  CheckUserPrivilegesForAppResp,
  CreateAppReq,
  GetAllowedAiProvidersForAppResp,
  ListAppsResp,
  UpdateAppReq,
} from './types/api';
import { AuthedRequest } from '../auth/types/service';
import { AppEntityWithOrgTeamAiProviderJoined } from './types/service';
import { OrgsMemberGuard } from '../orgs/orgs.guard';
import {
  AppsAdminCreationGuard,
  AppsAdminGuard,
  AppsMemberGuard,
  AppsOrgMemberGuard,
} from './apps.guard';

@Controller()
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post('orgs/:orgId/apps')
  @UseGuards(AppsAdminCreationGuard)
  @ApiResponse({ status: '2XX', type: AppResp })
  async createApp(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() createAppReq: CreateAppReq,
  ): Promise<AppResp> {
    return this.appEntityToAppResp(
      await this.appsService.createApp(orgId, createAppReq),
    );
  }

  @Get('orgs/:orgId/apps')
  @UseGuards(OrgsMemberGuard)
  @ApiResponse({ status: '2XX', type: ListAppsResp })
  async listAppsForUser(
    @Request() req: AuthedRequest,
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<ListAppsResp> {
    const appsPage = await this.appsService.listAppsForUser(
      req.user,
      orgId,
      page,
    );
    return {
      data: appsPage.data.map(this.appEntityToAppResp),
      nextPageCursor: appsPage.nextPageCursor,
    };
  }

  @Put('apps/:appId')
  @UseGuards(AppsAdminGuard)
  @ApiResponse({ status: '2XX', type: AppResp })
  async updateApp(
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body() updateAppReq: UpdateAppReq,
  ): Promise<AppResp> {
    return this.appEntityToAppResp(
      await this.appsService.updateApp(appId, updateAppReq),
    );
  }

  @Get('apps/:appId')
  @UseGuards(AppsMemberGuard)
  @ApiResponse({ status: '2XX', type: AppResp })
  async getApp(@Param('appId', ParseUUIDPipe) appId: string): Promise<AppResp> {
    return this.appEntityToAppResp(await this.appsService.getAppById(appId));
  }

  /**
   * This is accessible by all org members, hence the response does not return sensitive data like api key.
   */
  @Get('apps/:appId/allowed-ai-providers')
  @UseGuards(AppsMemberGuard)
  @ApiResponse({ status: '2XX', type: GetAllowedAiProvidersForAppResp })
  async getAllowedAiProvidersForApp(
    @Param('appId', ParseUUIDPipe) appId: string,
  ): Promise<GetAllowedAiProvidersForAppResp> {
    const allowedAiProviders =
      await this.appsService.getAllowedAiProvidersForApp(appId);
    return {
      data: allowedAiProviders.data.map((aiProvider) => ({
        id: aiProvider.id,
        name: aiProvider.name,
        description: aiProvider.description,
        aiProvider: aiProvider.aiProvider,
      })),
    };
  }

  @Get('apps/:appId/check-user-privileges')
  @UseGuards(AppsOrgMemberGuard)
  @ApiResponse({ status: '2XX', type: CheckUserPrivilegesForAppResp })
  async checkUserPrivilegesForApp(
    @Request() req: AuthedRequest,
    @Param('appId', ParseUUIDPipe) appId: string,
  ): Promise<CheckUserPrivilegesForAppResp> {
    return await this.appsService.checkUserPrivilegesForApp(req.user, appId);
  }

  private appEntityToAppResp(
    appEntity: AppEntityWithOrgTeamAiProviderJoined,
  ): AppResp {
    return {
      id: appEntity.id,
      createdAt: appEntity.createdAt,
      updatedAt: appEntity.updatedAt,
      name: appEntity.name,
      description: appEntity.description,
      type: appEntity.type,
      systemPrompt: appEntity.systemPrompt,
      introductionMessage: appEntity.introductionMessage,
      outputJsonSchema: appEntity.outputJsonSchema,
      org: {
        id: appEntity.org.id,
        name: appEntity.org.name,
      },
      team: appEntity.orgTeam
        ? {
            id: appEntity.orgTeam.id,
            name: appEntity.orgTeam.name,
          }
        : null,
      aiProvider: appEntity.aiProvider
        ? {
            id: appEntity.aiProvider.id,
            provider: appEntity.aiProvider.aiProvider,
            name: appEntity.aiProvider.name,
            description: appEntity.aiProvider.description,
          }
        : null,
      aiModel: appEntity.aiModel,
      temperature: appEntity.temperature,
    };
  }
}
