import { AiProvider } from '@/utils/backend/client/common/types';

export class CreateAiIntegrationReq {
  restrictedToTeamId: string | null;
  name: string;
  description: string;
  aiProvider: AiProvider;
  aiProviderApiKey: string;
  aiProviderApiUrl: string | null;
  aiModel: string;
  orgId: string;
}

export class UpdateAiIntegrationReq {
  aiIntegrationId: string;
  restrictedToTeamId: string | null;
  name: string;
  description: string;
  aiProvider: AiProvider;
  aiProviderApiKey: string;
  aiProviderApiUrl: string | null;
  aiModel: string;
}
