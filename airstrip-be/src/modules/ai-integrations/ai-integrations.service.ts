import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { InfisicalClient } from '@infisical/sdk';
import { nanoid } from 'nanoid';

export const AI_INTEGRATIONS_SERVICE_CONFIG = 'AI_INTEGRATIONS_SERVICE_CONFIG';

export type AiIntegrationsServiceConfig = {
  infisicalApiUrl: string;
  infisicalClientId: string;
  infisicalClientSecret: string;
  infisicalProjectId: string;
  infisicalEnvironment: string;
};

@Injectable()
export class AiIntegrationsService {
  private readonly infisicalClient: InfisicalClient;

  constructor(
    @InjectRepository(AiIntegrationEntity)
    private readonly aiIntegrationRepository: Repository<AiIntegrationEntity>,
    private readonly orgTeamsService: OrgTeamsService,
    @Inject(AI_INTEGRATIONS_SERVICE_CONFIG)
    private readonly config: AiIntegrationsServiceConfig,
  ) {
    this.infisicalClient = new InfisicalClient({
      siteUrl: this.config.infisicalApiUrl,
      cacheTtl: 600, // increase cacheTtl from default of 5mins to 10mins since api keys shouldn't change often
      auth: {
        universalAuth: {
          clientId: this.config.infisicalClientId,
          clientSecret: this.config.infisicalClientSecret,
        },
      },
    });
  }

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
      aiProviderKeyVaultKey: await this.storeKeyInVault({
        secretValue: dto.aiProviderApiKey,
        secretName: nanoid(), // must be unique
        mode: 'create',
      }),
      aiProviderApiUrl: dto.aiProviderApiUrl,
      aiModel: dto.aiModel,
    });

    const { aiProviderKeyVaultKey, ...rest } = aiIntegration;

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
      aiProviderKeyVaultKey: await this.storeKeyInVault({
        secretValue: dto.aiProviderApiKey,
        secretName: aiIntegration.aiProviderKeyVaultKey,
        mode: 'update',
      }),
      aiProviderApiUrl: dto.aiProviderApiUrl,
      aiModel: dto.aiModel,
    });

    const { aiProviderKeyVaultKey, ...rest } = aiIntegration;

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

    const aiIntegrationEntity = await this.aiIntegrationRepository.findOne({
      where: {
        id: aiIntegrationId,
      },
    });

    if (!aiIntegrationEntity) {
      return;
    }

    await this.deleteKeyInVault({
      secretName: aiIntegrationEntity.aiProviderKeyVaultKey,
    });

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

    const { aiProviderKeyVaultKey, ...rest } = aiIntegration;

    return {
      ...rest,
      aiProviderApiKey: await this.readKeyFromVault(aiProviderKeyVaultKey),
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

  async readKeyFromVault(secretName: string): Promise<string> {
    return (
      await this.infisicalClient.getSecret({
        environment: this.config.infisicalEnvironment,
        projectId: this.config.infisicalProjectId,
        secretName,
        path: '/',
        type: 'shared',
      })
    ).secretValue;
  }

  private async storeKeyInVault({
    secretValue,
    secretName,
    mode,
  }: {
    secretValue: string;
    secretName: string;
    mode: 'create' | 'update';
  }): Promise<string> {
    const body = {
      projectId: this.config.infisicalProjectId,
      environment: this.config.infisicalEnvironment,
      secretName,
      secretValue,
      path: '/',
      type: 'shared',
    };
    if (mode === 'update') {
      const updateSecretResp = await this.infisicalClient.updateSecret(body);
      return updateSecretResp.secretKey;
    } else if (mode === 'create') {
      const createSecretResp = await this.infisicalClient.createSecret(body);
      return createSecretResp.secretKey;
    } else {
      throw new InternalServerErrorException('Invalid mode.');
    }
  }

  private async deleteKeyInVault({
    secretName,
  }: {
    secretName: string;
  }): Promise<void> {
    await this.infisicalClient.deleteSecret({
      secretName,
      environment: this.config.infisicalEnvironment,
      projectId: this.config.infisicalProjectId,
      path: '/',
      type: 'shared',
    });
  }
}
