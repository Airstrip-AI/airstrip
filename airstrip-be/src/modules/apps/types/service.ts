import { AiIntegrationEntity } from '../../ai-integrations/ai-integration.entity';
import { OrgTeamEntity } from '../../org-teams/org-team.entity';
import { OrganizationEntity } from '../../orgs/organization.entity';
import { AppEntity } from '../app.entity';
import { AppType } from './common';

export type CreateAppServiceDto = {
  name: string;
  description: string;
  type: AppType;
  teamId: string | null;
};

export type UpdateAppServiceDto = {
  name: string;
  description: string;
  type: AppType;
  aiProviderId: string | null;
  systemPrompt: string | null;
  introductionMessage: string | null;
  outputJsonSchema: string | null;
  temperature: number;
};

export type AppEntityWithOrgTeamAiProviderJoined = AppEntity & {
  org: OrganizationEntity;
  orgTeam: OrgTeamEntity | null;
  aiProvider: AiIntegrationEntity | null;
};
