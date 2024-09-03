import { AiIntegrationResp, AiIntegrationWithApiKeyResp } from './api';
import {
  AiIntegrationWithApiKeyAndOrgTeamServiceDto,
  AiIntegrationWithOrgTeamServiceDto,
} from './service';

export enum AiProvider {
  OPENAI = 'OPENAI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE',
  MISTRAL = 'MISTRAL',
  GOOGLE = 'GOOGLE',
  COHERE = 'COHERE',
  ANTHROPIC = 'ANTHROPIC',
}

export function aiIntegrationWithOrgTeamToResp(
  dto: AiIntegrationWithOrgTeamServiceDto,
): AiIntegrationResp {
  return {
    id: dto.id,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    orgId: dto.orgId,
    restrictedToTeam: dto.restrictedToTeam
      ? {
          id: dto.restrictedToTeam.id,
          name: dto.restrictedToTeam.name,
        }
      : null,
    name: dto.name,
    description: dto.description,
    aiProvider: dto.aiProvider,
    aiProviderApiUrl: dto.aiProviderApiUrl,
    aiModel: dto.aiModel,
  };
}

export function aiIntegrationWithApiKeyAndOrgTeamToResp(
  dto: AiIntegrationWithApiKeyAndOrgTeamServiceDto,
): AiIntegrationWithApiKeyResp {
  return {
    ...aiIntegrationWithOrgTeamToResp(dto),
    aiProviderApiKey: dto.aiProviderApiKey,
  };
}
