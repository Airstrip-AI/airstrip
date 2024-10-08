import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatEntity } from './chat.entity';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from './chat-message.entity';
import { AuthedUser } from '../auth/types/service';
import { AppsService } from '../apps/apps.service';
import {
  ChatMessageEntityWithChatAndAppJoined,
  SaveChatMessageServiceDto,
} from './types/service';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly chatMessageRepository: Repository<ChatMessageEntity>,
    private readonly appsService: AppsService,
  ) {}

  async getChatById(chatId: string): Promise<ChatEntity> {
    const chat = await this.chatRepository.findOne({
      where: {
        id: chatId,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async createNewChatWithFirstMessage(
    user: AuthedUser,
    appId: string,
    firstMessage: SaveChatMessageServiceDto,
  ): Promise<ChatEntity & { firstMessage: ChatMessageEntity }> {
    const app = await this.appsService.getAppById(appId);
    const userOrg = user.orgs.find((org) => org.id === app.orgId);
    if (!userOrg) {
      throw new UnauthorizedException('User does not have access to this app');
    }

    const chat = await this.chatRepository.save({
      orgId: app.orgId,
      appId: app.id,
      userId: user.id,
    });

    const savedFirstMessage = await this.saveChatMessage(
      user,
      chat.id,
      firstMessage,
    );

    return {
      ...chat,
      firstMessage: savedFirstMessage,
    };
  }

  async saveChatMessage(
    user: AuthedUser,
    chatId: string,
    dto: SaveChatMessageServiceDto,
  ): Promise<ChatMessageEntity> {
    const chat = await this.chatRepository.findOne({
      where: {
        id: chatId,
      },
    });
    if (!chat || chat.userId !== user.id) {
      throw new NotFoundException('Chat not found');
    }

    return this.chatMessageRepository.save({
      chatId,
      role: dto.role,
      clientGeneratedId: dto.clientGeneratedId,
      content: dto.content,
      attachments: dto.attachments,
      createdAt: dto.createdAt,
    });
  }

  async findByClientGeneratedIdJoinChatAndApp(
    clientGeneratedId: string,
  ): Promise<ChatMessageEntityWithChatAndAppJoined> {
    const chatMessage = await this.chatMessageRepository.findOne({
      where: {
        clientGeneratedId,
      },
      relations: {
        chat: {
          app: {
            aiProvider: true,
          },
        },
      },
    });

    if (!chatMessage) {
      throw new NotFoundException(
        `Chat message with clientGeneratedId '${clientGeneratedId}' not found`,
      );
    }

    return chatMessage as ChatMessageEntityWithChatAndAppJoined;
  }

  async countAppMessagesByRole(appIds: string[]): Promise<
    Map<
      string,
      {
        appId: string;
        totalUserMessages: number;
        totalAssistantMessages: number;
      }
    >
  > {
    const appMessageCounts: {
      app_id: string;
      role: string;
      count: string;
    }[] = appIds.length
      ? await this.chatMessageRepository.query(
          `SELECT c.app_id, cm.role, count(*) FROM chat_messages cm JOIN chats c ON cm.chat_id=c.id WHERE c.app_id = ANY($1) GROUP BY c.app_id, cm.role`,
          [appIds],
        )
      : [];

    return appMessageCounts.reduce(
      (acc, row) => {
        const rowCount = parseInt(row.count);
        const isUserMessage = row.role === 'user';

        let appMessageCountsForApp = acc.get(row.app_id);
        if (!appMessageCountsForApp) {
          appMessageCountsForApp = {
            appId: row.app_id,
            totalUserMessages: 0,
            totalAssistantMessages: 0,
          };
          acc.set(row.app_id, appMessageCountsForApp);
        }

        if (isUserMessage) {
          appMessageCountsForApp.totalUserMessages += rowCount;
        } else {
          appMessageCountsForApp.totalAssistantMessages += rowCount;
        }

        return acc;
      },
      new Map<
        string,
        {
          appId: string;
          totalUserMessages: number;
          totalAssistantMessages: number;
        }
      >(),
    );
  }
}
