import { AiProvider } from '@/utils/backend/client/common/types';

class App {
  id: string;
  name: string;
}

class TokenUsageData {
  aiProvider: AiProvider;
  aiModel: string;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

export class AppUsageData {
  app: App;
  totalUserMessages: number;
  totalAssistantMessages: number;
  tokensUsage: TokenUsageData[];
}

export class AppsUsageDataResponse {
  data: AppUsageData[];
}
