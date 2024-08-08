import { AiIntegrationKeyResp } from './api';
import { AiIntegrationEntityWithOrgTeamJoined } from './service';

export enum AiProvider {
  OPENAI = 'OPENAI',
  OPENAI_COMPATIBLE = 'OPENAI_COMPATIBLE',
  MISTRAL = 'MISTRAL',
  GOOGLE = 'GOOGLE',
  COHERE = 'COHERE',
  ANTHROPIC = 'ANTHROPIC',
}

export function aiIntegrationEntityWithOrgTeamToResp(
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
