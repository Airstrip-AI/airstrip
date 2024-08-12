import { AiIntegrationEntity } from '../../ai-integrations/ai-integration.entity';
import { AppEntity } from '../../apps/app.entity';
import { ChatMessageEntity } from '../chat-message.entity';
import { ChatEntity } from '../chat.entity';

export type SaveChatMessageServiceDto = {
  role: string;
  clientGeneratedId: string;
  content: string;
  attachments:
    | {
        name?: string;
        contentType?: string;
        url: string;
      }[]
    | null;
  createdAt: Date;
};

type AppEntityWithAiProviderJoined = AppEntity & {
  aiProvider: AiIntegrationEntity | null;
};

export type ChatEntityWithAppJoined = ChatEntity & {
  app: AppEntityWithAiProviderJoined;
};

export type ChatMessageEntityWithChatAndAppJoined = ChatMessageEntity & {
  chat: ChatEntityWithAppJoined;
};
