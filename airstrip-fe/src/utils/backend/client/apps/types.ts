import { AiIntegrationKeyResp } from '@/utils/backend/client/ai-integrations/types';
import {
  AiProvider,
  AppType,
  UserRole,
} from '@/utils/backend/client/common/types';

export class CreateAppReq {
  name: string;
  description: string;
  type: AppType;
  teamId: string | null;
}

export class UpdateAppReq {
  name: string;
  description: string;
  type: AppType;
  aiProviderId: string | null;
  systemPrompt: string | null;
  introductionMessage: string | null;
  outputJsonSchema: string | null;
  aiModel: string | null;
  temperature: number;
}

class OrgResp {
  id: string;
  name: string;
}

class TeamResp {
  id: string;
  name: string;
}

class AiIntegrationResp {
  id: string;
  provider: AiProvider;
  name: string;
  description: string;
}

export class AppResp {
  id: string;
  createdAt: string;
  updatedAt: string;
  org: OrgResp;
  team: TeamResp | null;
  name: string;
  description: string;
  type: AppType;
  aiProvider: AiIntegrationResp | null;
  systemPrompt: string | null;
  introductionMessage: string | null;
  outputJsonSchema: string | null;
  aiModel: string | null;
  temperature: number;
}

export class ListAppsResp {
  data: AppResp[];
  nextPageCursor: string | null;
}

export class GetAllowedAiProvidersForAppResp {
  data: {
    id: string;
    name: string;
    description: string;
    aiProvider: AiProvider;
  }[];
}

export class CheckUserPrivilegesForAppResp {
  accessLevel: UserRole | null;
}
