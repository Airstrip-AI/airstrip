import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AiIntegrationEntity } from './ai-integration.entity';
import { IsNull, Repository } from 'typeorm';
import {
  AiIntegrationEntityWithOrgTeamJoined,
  CreateAiIntegrationDto,
  UpdateAiIntegrationDto,
} from './types/service';
import { OrgTeamsService } from '../org-teams/org-teams.service';
import { OrgTeamEntity } from '../org-teams/org-team.entity';

@Injectable()
export class AiIntegrationsService {
  constructor(
    @InjectRepository(AiIntegrationEntity)
    private readonly aiIntegrationRepository: Repository<AiIntegrationEntity>,
    private readonly orgTeamsService: OrgTeamsService,
  ) {}

  async createAiIntegration(
    orgId: string,
    dto: CreateAiIntegrationDto,
  ): Promise<AiIntegrationEntityWithOrgTeamJoined> {
    const duplicateApiKey = await this.aiIntegrationRepository.findOne({
      where: {
        aiProviderApiKey: dto.aiProviderApiKey,
      },
    });

    if (duplicateApiKey) {
      throw new BadRequestException('This API key is already in use.');
    }

    let orgTeam: OrgTeamEntity | null = null;
    if (dto.restrictedToTeamId) {
      orgTeam = await this.orgTeamsService.getOrgTeamById(
        dto.restrictedToTeamId,
      );
      if (orgTeam.orgId !== orgId) {
        throw new BadRequestException(
          'Team does not belong to the organization.',
        );
      }
    }

    const aiIntegration = await this.aiIntegrationRepository.save({
      orgId,
      restrictedToTeamId: orgTeam?.id ?? null,
      name: dto.name,
      description: dto.description,
      aiProvider: dto.aiProvider,
      aiProviderApiKey: dto.aiProviderApiKey,
      aiProviderApiUrl: dto.aiProviderApiUrl,
    });

    aiIntegration.restrictedToTeam = orgTeam;

    return aiIntegration as AiIntegrationEntityWithOrgTeamJoined;
  }

  async updateAiIntegration(
    aiIntegrationId: string,
    dto: UpdateAiIntegrationDto,
  ): Promise<AiIntegrationEntityWithOrgTeamJoined> {
    let aiIntegration = await this.aiIntegrationRepository.findOne({
      where: {
        id: aiIntegrationId,
      },
    });

    if (!aiIntegration) {
      throw new NotFoundException('AI integration not found.');
    }

    let orgTeam: OrgTeamEntity | null = null;
    if (dto.restrictedToTeamId) {
      orgTeam = await this.orgTeamsService.getOrgTeamById(
        dto.restrictedToTeamId,
      );
      if (orgTeam.orgId !== aiIntegration.orgId) {
        throw new BadRequestException(
          'Different orgs for AI integration and team.',
        );
      }
    }

    aiIntegration = await this.aiIntegrationRepository.save({
      ...aiIntegration,
      restrictedToTeamId: dto.restrictedToTeamId,
      name: dto.name,
      description: dto.description,
      aiProvider: dto.aiProvider,
      aiProviderApiKey: dto.aiProviderApiKey,
      aiProviderApiUrl: dto.aiProviderApiUrl,
    });

    aiIntegration.restrictedToTeam = orgTeam;
    return aiIntegration as AiIntegrationEntityWithOrgTeamJoined;
  }

  async deleteAiIntegration(aiIntegrationId: string): Promise<void> {
    if (!aiIntegrationId) {
      return;
    }

    await this.aiIntegrationRepository.delete({
      id: aiIntegrationId,
    });
  }

  async getAiIntegration(
    aiIntegrationId: string,
  ): Promise<AiIntegrationEntityWithOrgTeamJoined> {
    const aiIntegration = (await this.aiIntegrationRepository.findOne({
      where: {
        id: aiIntegrationId,
      },
      relations: {
        restrictedToTeam: true,
      },
    })) as AiIntegrationEntityWithOrgTeamJoined;

    if (!aiIntegration) {
      throw new NotFoundException('AI integration not found.');
    }

    return aiIntegration;
  }

  async listAiIntegrationsInOrg(
    orgId: string,
    page: number,
  ): Promise<{
    data: AiIntegrationEntityWithOrgTeamJoined[];
    nextPageCursor: string | null;
  }> {
    const pageSize = 50;

    const aiIntegrationsPage = (await this.aiIntegrationRepository.find({
      where: {
        orgId,
      },
      relations: {
        restrictedToTeam: true,
      },
      take: pageSize + 1,
      skip: page * pageSize,
    })) as AiIntegrationEntityWithOrgTeamJoined[];

    return {
      data: aiIntegrationsPage.slice(0, pageSize),
      nextPageCursor:
        aiIntegrationsPage.length > pageSize ? String(page + 1) : null,
    };
  }

  async listAiIntegrationsAccessibleByTeam(orgTeamId: string): Promise<{
    data: AiIntegrationEntityWithOrgTeamJoined[];
  }> {
    const orgTeam = await this.orgTeamsService.getOrgTeamById(orgTeamId);
    return {
      data: (await this.aiIntegrationRepository.find({
        where: [
          {
            orgId: orgTeam.orgId,
            restrictedToTeamId: IsNull(),
          },
          {
            orgId: orgTeam.orgId,
            restrictedToTeamId: orgTeamId,
          },
        ],
        relations: {
          restrictedToTeam: true,
        },
      })) as AiIntegrationEntityWithOrgTeamJoined[],
    };
  }
}
