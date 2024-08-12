import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageTokenUsageDataEntity } from './message-token-usage-data.entity';
import { Repository } from 'typeorm';
import { ChatMessagesService } from '../chat-messages/chat-messages.service';
import { AuthedUser } from '../auth/types/service';

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
}
