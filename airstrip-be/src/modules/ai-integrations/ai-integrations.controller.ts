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
  ListAiIntegrationsResp,
  UpdateAiIntegrationReq,
} from './types/api';
import { ApiResponse } from '@nestjs/swagger';
import { OrgsGuard } from '../orgs/orgs.guard';
import { UserRole } from '../../utils/constants';
import { AiIntegrationsGuard } from './ai-integrations.guard';
import { MessageResp } from '../../utils/common';
import { OrgTeamsGuard } from '../org-teams/org-teams.guard';
import { AiIntegrationEntityWithOrgTeamJoined } from './types/service';

@Controller('ai-integrations')
export class AiIntegrationsController {
  constructor(private readonly aiIntegrationsService: AiIntegrationsService) {}

  @Post('orgs/:orgId')
  @UseGuards(OrgsGuard(UserRole.ADMIN))
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

    return this.aiIntegrationEntityWithOrgTeamToResp(aiIntegrationEntity);
  }

  @Put(':aiIntegrationId')
  @UseGuards(AiIntegrationsGuard(UserRole.ADMIN))
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

    return this.aiIntegrationEntityWithOrgTeamToResp(aiIntegrationEntity);
  }

  @Delete(':aiIntegrationId')
  @UseGuards(AiIntegrationsGuard(UserRole.ADMIN))
  @ApiResponse({ status: '2XX', type: MessageResp })
  async deleteAiIntegration(
    @Param('aiIntegrationId', ParseUUIDPipe) aiIntegrationId: string,
  ): Promise<MessageResp> {
    await this.aiIntegrationsService.deleteAiIntegration(aiIntegrationId);
    return {
      message: 'AI integration deleted',
    };
  }

  @Get(':aiIntegrationId')
  @UseGuards(AiIntegrationsGuard(UserRole.ADMIN))
  @ApiResponse({ status: '2XX', type: AiIntegrationKeyResp })
  async getAiIntegration(
    @Param('aiIntegrationId', ParseUUIDPipe) aiIntegrationId: string,
  ): Promise<AiIntegrationKeyResp> {
    const aiIntegrationEntity =
      await this.aiIntegrationsService.getAiIntegration(aiIntegrationId);

    return this.aiIntegrationEntityWithOrgTeamToResp(aiIntegrationEntity);
  }

  @Get('orgs/:orgId')
  @UseGuards(OrgsGuard(UserRole.ADMIN))
  @ApiResponse({ status: '2XX', type: ListAiIntegrationsResp })
  async listAiIntegrationsInOrg(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<ListAiIntegrationsResp> {
    const aiIntegrationEntitiesPage =
      await this.aiIntegrationsService.listAiIntegrationsInOrg(orgId, page);

    return {
      data: aiIntegrationEntitiesPage.data.map(
        this.aiIntegrationEntityWithOrgTeamToResp,
      ),
      nextPageCursor: aiIntegrationEntitiesPage.nextPageCursor,
    };
  }

  @Get('org-teams/:orgTeamId')
  @UseGuards(
    OrgTeamsGuard({
      teamMinimumRole: UserRole.ADMIN,
      orgMinimumRole: UserRole.ADMIN,
    }),
  )
  @ApiResponse({ status: '2XX', type: ListAiIntegrationsResp })
  async listAiIntegrationsAccessibleByTeam(
    @Param('orgTeamId', ParseUUIDPipe) orgTeamId: string,
  ): Promise<ListAiIntegrationsResp> {
    const aiIntegrationEntitiesPage =
      await this.aiIntegrationsService.listAiIntegrationsAccessibleByTeam(
        orgTeamId,
      );

    return {
      data: aiIntegrationEntitiesPage.data.map(
        this.aiIntegrationEntityWithOrgTeamToResp,
      ),
      nextPageCursor: null,
    };
  }

  private aiIntegrationEntityWithOrgTeamToResp(
    aiIntegrationEntity: AiIntegrationEntityWithOrgTeamJoined,
  ): AiIntegrationKeyResp {
    return {
      id: aiIntegrationEntity.id,
      createdAt: aiIntegrationEntity.createdAt,
      updatedAt: aiIntegrationEntity.updatedAt,
      orgId: aiIntegrationEntity.orgId,
      restrictedToTeam: aiIntegrationEntity.restrictedToTeam
        ? {
            id: aiIntegrationEntity.restrictedToTeam.id,
            name: aiIntegrationEntity.restrictedToTeam.name,
          }
        : null,
      name: aiIntegrationEntity.name,
      description: aiIntegrationEntity.description,
      aiProvider: aiIntegrationEntity.aiProvider,
      aiProviderApiUrl: aiIntegrationEntity.aiProviderApiUrl,
      aiProviderApiKey: aiIntegrationEntity.aiProviderApiKey,
    };
  }
}
