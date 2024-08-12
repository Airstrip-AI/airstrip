import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AiIntegrationsService } from './ai-integrations.service';
import {
  AiIntegrationKeyResp,
  CreateAiIntegrationReq,
  GetAllAiIntegrationsAccessibleByTeamResp,
  ListAiIntegrationsResp,
  UpdateAiIntegrationReq,
} from './types/api';
import { ApiResponse } from '@nestjs/swagger';
import { AiIntegrationsAdminGuard } from './ai-integrations.guard';
import { MessageResp } from '../../utils/common';
import { aiIntegrationEntityWithOrgTeamToResp } from './types/common';
import { OrgsAdminGuard } from '../orgs/orgs.guard';
import { OrgTeamsAdminGuard } from '../org-teams/org-teams.guard';

@Controller()
export class AiIntegrationsController {
  constructor(private readonly aiIntegrationsService: AiIntegrationsService) {}

  @Post('orgs/:orgId/ai-integrations')
  @UseGuards(OrgsAdminGuard)
  @ApiResponse({ status: '2XX', type: AiIntegrationKeyResp })
  async createAiIntegration(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() body: CreateAiIntegrationReq,
  ): Promise<AiIntegrationKeyResp> {
    const aiIntegrationEntity =
      await this.aiIntegrationsService.createAiIntegration(orgId, {
        restrictedToTeamId: body.restrictedToTeamId,
        name: body.name,
        description: body.description,
        aiProvider: body.aiProvider,
        aiProviderApiKey: body.aiProviderApiKey,
        aiProviderApiUrl: body.aiProviderApiUrl,
      });

    return aiIntegrationEntityWithOrgTeamToResp(aiIntegrationEntity);
  }

  @Get('orgs/:orgId/ai-integrations')
  @UseGuards(OrgsAdminGuard)
  @ApiResponse({ status: '2XX', type: ListAiIntegrationsResp })
  async listAiIntegrationsInOrg(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<ListAiIntegrationsResp> {
    const aiIntegrationEntitiesPage =
      await this.aiIntegrationsService.listAiIntegrationsInOrg(orgId, page);

    return {
      data: aiIntegrationEntitiesPage.data.map(
        aiIntegrationEntityWithOrgTeamToResp,
      ),
      nextPageCursor: aiIntegrationEntitiesPage.nextPageCursor,
    };
  }

  @Get('org-teams/:orgTeamId/ai-integrations')
  @UseGuards(OrgTeamsAdminGuard)
  @ApiResponse({
    status: '2XX',
    type: GetAllAiIntegrationsAccessibleByTeamResp,
  })
  async getAllAiIntegrationsAccessibleByTeam(
    @Param('orgTeamId', ParseUUIDPipe) orgTeamId: string,
  ): Promise<GetAllAiIntegrationsAccessibleByTeamResp> {
    const aiIntegrationEntitiesPage =
      await this.aiIntegrationsService.getAllAiIntegrationsAccessibleByTeam(
        orgTeamId,
      );

    return {
      data: aiIntegrationEntitiesPage.data.map(
        aiIntegrationEntityWithOrgTeamToResp,
      ),
    };
  }

  @Put('ai-integrations/:aiIntegrationId')
  @UseGuards(AiIntegrationsAdminGuard)
  @ApiResponse({ status: '2XX', type: AiIntegrationKeyResp })
  async updateAiIntegration(
    @Param('aiIntegrationId', ParseUUIDPipe) aiIntegrationId: string,
    @Body() body: UpdateAiIntegrationReq,
  ): Promise<AiIntegrationKeyResp> {
    const aiIntegrationEntity =
      await this.aiIntegrationsService.updateAiIntegration(aiIntegrationId, {
        restrictedToTeamId: body.restrictedToTeamId,
        name: body.name,
        description: body.description,
        aiProvider: body.aiProvider,
        aiProviderApiKey: body.aiProviderApiKey,
        aiProviderApiUrl: body.aiProviderApiUrl,
      });

    return aiIntegrationEntityWithOrgTeamToResp(aiIntegrationEntity);
  }

  @Delete('ai-integrations/:aiIntegrationId')
  @UseGuards(AiIntegrationsAdminGuard)
  @ApiResponse({ status: '2XX', type: MessageResp })
  async deleteAiIntegration(
    @Param('aiIntegrationId', ParseUUIDPipe) aiIntegrationId: string,
  ): Promise<MessageResp> {
    await this.aiIntegrationsService.deleteAiIntegration(aiIntegrationId);
    return {
      message: 'AI integration deleted',
    };
  }

  @Get('ai-integrations/:aiIntegrationId')
  @UseGuards(AiIntegrationsAdminGuard)
  @ApiResponse({ status: '2XX', type: AiIntegrationKeyResp })
  async getAiIntegration(
    @Param('aiIntegrationId', ParseUUIDPipe) aiIntegrationId: string,
  ): Promise<AiIntegrationKeyResp> {
    const aiIntegrationEntity =
      await this.aiIntegrationsService.getAiIntegration(aiIntegrationId);

    return aiIntegrationEntityWithOrgTeamToResp(aiIntegrationEntity);
  }
}
