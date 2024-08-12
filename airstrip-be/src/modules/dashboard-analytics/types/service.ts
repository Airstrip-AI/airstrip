import { AiProvider } from '../../ai-integrations/types/common';

export type AppsUsageDataServiceDto = {
  data: {
    app: {
      id: string;
      name: string;
    };
    totalUserMessages: number;
    totalAssistantMessages: number;
    tokensUsage: {
      aiProvider: AiProvider;
      aiModel: string;
      totalPromptTokens: number;
      totalCompletionTokens: number;
    }[];
  }[];
};
