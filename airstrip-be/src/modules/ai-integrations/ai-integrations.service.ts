import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AiIntegrationEntity } from './ai-integration.entity';
import { IsNull, Repository } from 'typeorm';
import {
  AiIntegrationWithApiKeyAndOrgTeamServiceDto,
  AiIntegrationWithOrgTeamServiceDto,
  CreateAiIntegrationDto,
  UpdateAiIntegrationDto,
} from './types/service';
import { OrgTeamsService } from '../org-teams/org-teams.service';
import { OrgTeamEntity } from '../org-teams/org-team.entity';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class AiIntegrationsService {
  constructor(
    @InjectRepository(AiIntegrationEntity)
    private readonly aiIntegrationRepository: Repository<AiIntegrationEntity>,
    private readonly orgTeamsService: OrgTeamsService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async createAiIntegration(
    orgId: string,
    dto: CreateAiIntegrationDto,
  ): Promise<AiIntegrationWithApiKeyAndOrgTeamServiceDto> {
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
      aiProviderApiKeyEncrypted: await this.encryptionService.encrypt(
        dto.aiProviderApiKey,
      ),
      aiProviderApiUrl: dto.aiProviderApiUrl,
      aiModel: dto.aiModel,
    });

    const { aiProviderApiKeyEncrypted, ...rest } = aiIntegration;

    return {
      ...rest,
      restrictedToTeam: orgTeam,
      aiProviderApiKey: dto.aiProviderApiKey,
    };
  }

  async updateAiIntegration(
    aiIntegrationId: string,
    dto: UpdateAiIntegrationDto,
  ): Promise<AiIntegrationWithApiKeyAndOrgTeamServiceDto> {
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
      aiProviderApiKeyEncrypted: await this.encryptionService.encrypt(
        dto.aiProviderApiKey,
      ),
      aiProviderApiUrl: dto.aiProviderApiUrl,
      aiModel: dto.aiModel,
    });

    const { aiProviderApiKeyEncrypted, ...rest } = aiIntegration;

    return {
      ...rest,
      restrictedToTeam: orgTeam,
      aiProviderApiKey: dto.aiProviderApiKey,
    };
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
  ): Promise<AiIntegrationWithApiKeyAndOrgTeamServiceDto> {
    const aiIntegration = await this.aiIntegrationRepository.findOne({
      where: {
        id: aiIntegrationId,
      },
      relations: {
        restrictedToTeam: true,
      },
    });

    if (!aiIntegration) {
      throw new NotFoundException('AI integration not found.');
    }

    const { aiProviderApiKeyEncrypted, ...rest } = aiIntegration;

    return {
      ...rest,
      aiProviderApiKey: await this.encryptionService.decrypt(
        aiProviderApiKeyEncrypted,
      ),
    } as AiIntegrationWithApiKeyAndOrgTeamServiceDto;
  }

  async listAiIntegrationsInOrg(
    orgId: string,
    page: number,
  ): Promise<{
    data: AiIntegrationWithOrgTeamServiceDto[];
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
    })) as AiIntegrationWithOrgTeamServiceDto[];

    return {
      data: aiIntegrationsPage.slice(0, pageSize),
      nextPageCursor:
        aiIntegrationsPage.length > pageSize ? String(page + 1) : null,
    };
  }

  async getAllOrgWideAiIntegrations(orgId: string): Promise<{
    data: AiIntegrationWithOrgTeamServiceDto[];
  }> {
    return {
      data: (await this.aiIntegrationRepository.find({
        where: [
          {
            orgId,
            restrictedToTeamId: IsNull(),
          },
        ],
        relations: {
          restrictedToTeam: true,
        },
      })) as AiIntegrationWithOrgTeamServiceDto[],
    };
  }

  async getAllAiIntegrationsAccessibleByTeam(orgTeamId: string): Promise<{
    data: AiIntegrationWithOrgTeamServiceDto[];
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
      })) as AiIntegrationWithOrgTeamServiceDto[],
    };
  }
}
