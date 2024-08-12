import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { ApiResponse } from '@nestjs/swagger';
import {
  CreateChatWithFirstMessageReq,
  CreateChatWithFirstMessageResp,
  SaveChatMessageReq,
  SaveChatMessageResp,
} from './types/api';
import { AuthedRequest } from '../auth/types/service';
import { AppsAdminGuard } from '../apps/apps.guard';
import { ChatsUserGuard } from './chats.guard';

@Controller()
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Post('apps/:appId/chats')
  @UseGuards(AppsAdminGuard)
  @ApiResponse({ status: '2XX', type: CreateChatWithFirstMessageResp })
  async createNewChatWithFirstMessage(
    @Request() req: AuthedRequest,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body() body: CreateChatWithFirstMessageReq,
  ): Promise<CreateChatWithFirstMessageResp> {
    const chat = await this.chatMessagesService.createNewChatWithFirstMessage(
      req.user,
      appId,
      body.firstMessage,
    );

    return {
      chatId: chat.id,
      firstMessage: {
        id: chat.firstMessage.id,
        clientGeneratedId: chat.firstMessage.clientGeneratedId,
      },
    };
  }

  @Post('chats/:chatId/messages')
  @UseGuards(ChatsUserGuard)
  @ApiResponse({ status: '2XX', type: SaveChatMessageResp })
  async saveChatMessage(
    @Request() req: AuthedRequest,
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() body: SaveChatMessageReq,
  ): Promise<SaveChatMessageResp> {
    const message = await this.chatMessagesService.saveChatMessage(
      req.user,
      chatId,
      body,
    );

    return {
      id: message.id,
      clientGeneratedId: message.clientGeneratedId,
    };
  }
}
