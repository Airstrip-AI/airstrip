import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageTokenUsageDataEntity } from './message-token-usage-data.entity';
import { In, Repository } from 'typeorm';
import { ChatMessagesService } from '../chat-messages/chat-messages.service';
import { AuthedUser } from '../auth/types/service';
import { AiProvider } from '../ai-integrations/types/common';

@Injectable()
export class MessageTokenUsageDataService {
  constructor(
    @InjectRepository(MessageTokenUsageDataEntity)
    private readonly messageTokenUsageDataEntityRepo: Repository<MessageTokenUsageDataEntity>,
    private readonly chatMessagesService: ChatMessagesService,
  ) {}

  async saveUsageDataByClientGeneratedId(
    user: AuthedUser,
    clientGeneratedId: string,
    dto: {
      finishReason: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    },
  ): Promise<void> {
    const chatMessage =
      await this.chatMessagesService.findByClientGeneratedIdJoinChatAndApp(
        clientGeneratedId,
      );
    if (chatMessage.chat.userId !== user.id) {
      throw new UnauthorizedException('Not authorized');
    }

    await this.messageTokenUsageDataEntityRepo.save({
      chatMessageId: chatMessage.id,
      aiProvider: chatMessage.chat.app.aiProvider!.aiProvider,
      aiModel: chatMessage.chat.app.aiModel || '',
      orgId: chatMessage.chat.orgId,
      appId: chatMessage.chat.appId,
      usage: dto,
    });
  }

  async countAppTokensUsageGroupByAiProviderAndModel(appIds: string[]): Promise<
    Map<
      string,
      {
        appId: string;
        aiProvider: AiProvider;
        aiModel: string;
        totalPromptTokens: number;
        totalCompletionTokens: number;
      }[]
    >
  > {
    if (!appIds.length) {
      return new Map();
    }

    const messageTokenUsageData =
      await this.messageTokenUsageDataEntityRepo.find({
        where: {
          appId: In(appIds),
        },
      });

    // this is grouped by appId+aiProvider+aiModel
    const usageDataMap = messageTokenUsageData.reduce(
      (acc, usageData) => {
        const key = `${usageData.appId}-${usageData.aiProvider}-${usageData.aiModel}`;
        let tokenUsageData = acc.get(key);
        if (!tokenUsageData) {
          tokenUsageData = {
            appId: usageData.appId!, // because we are querying by appId, hence it will always be present
            aiProvider: usageData.aiProvider,
            aiModel: usageData.aiModel,
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
          };
          acc.set(key, tokenUsageData);
        }

        tokenUsageData.totalPromptTokens += usageData.usage.usage.promptTokens;
        tokenUsageData.totalCompletionTokens +=
          usageData.usage.usage.completionTokens;
        return acc;
      },
      new Map<
        string,
        {
          appId: string;
          aiProvider: AiProvider;
          aiModel: string;
          totalPromptTokens: number;
          totalCompletionTokens: number;
        }
      >(),
    );

    return Array.from(usageDataMap.values()).reduce((acc, tokenUsageData) => {
      let appTokenUsageDataArray = acc.get(tokenUsageData.appId);
      if (!appTokenUsageDataArray) {
        appTokenUsageDataArray = [];
        acc.set(tokenUsageData.appId, appTokenUsageDataArray);
      }
      appTokenUsageDataArray.push(tokenUsageData);
      return acc;
    }, new Map());
  }
}
