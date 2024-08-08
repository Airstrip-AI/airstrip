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
import { AppsGuard } from '../apps/apps.guard';
import { UserRole } from '../../utils/constants';
import { AuthedRequest } from '../auth/types/service';
import { Response } from 'express';
import { Message } from 'ai';

@Controller('app-chats')
export class AppChatsController {
  constructor(private readonly appChatsService: AppChatsService) {}

  @Post('stream/apps/:appId')
  @UseGuards(
    AppsGuard({
      teamMinimumRole: '*',
      orgMinimumRole: UserRole.ADMIN,
    }),
  )
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
