import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppChatsService } from './app-chats.service';
import { AuthedRequest } from '../auth/types/service';
import { Response } from 'express';
import { Message } from 'ai';
import { AppsMemberGuard } from '../apps/apps.guard';

@Controller()
export class AppChatsController {
  constructor(private readonly appChatsService: AppChatsService) {}

  @Post('apps/:appId/stream-chat')
  @UseGuards(AppsMemberGuard)
  async streamChatWithApp(
    @Request() req: AuthedRequest,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body()
    reqBody: {
      messages: Message[];
    },
    @Res() resp: Response,
  ) {
    return this.appChatsService.streamChatWithApp(
      appId,
      resp,
      reqBody.messages,
      req.user,
    );
  }
}
