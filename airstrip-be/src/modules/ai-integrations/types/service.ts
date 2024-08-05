import { OrgTeamEntity } from '../../org-teams/org-team.entity';
import { AiIntegrationEntity } from '../ai-integration.entity';
import { AiProvider } from './common';

export type CreateAiIntegrationDto = {
  restrictedToTeamId: string | null;
  name: string;
  description: string;
  aiProvider: AiProvider;
  aiProviderApiKey: string;
  aiProviderApiUrl: string | null;
};

export type UpdateAiIntegrationDto = {
  restrictedToTeamId: string | null;
  name: string;
  description: string;
  aiProvider: AiProvider;
  aiProviderApiKey: string;
  aiProviderApiUrl: string | null;
};

export type AiIntegrationEntityWithOrgTeamJoined = Omit<
  AiIntegrationEntity,
  'restrictedToTeam'
> & {
  restrictedToTeam: OrgTeamEntity | null;
};
