import { AppType } from '@/utils/backend/client/common/types';

export class CreateAppReq {
  name: string;
  description: string;
  type: AppType;
  teamId: string | null;
  systemPrompt?: string;
  systemPromptJson?: Record<string, any>[];
  introductionMessage?: string;
  temperature?: number;
}
