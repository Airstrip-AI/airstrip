import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ChatMessagesService } from './chat-messages.service';
import { validate as uuidValidate } from 'uuid';
import { AuthedUser } from '../auth/types/service';

@Injectable()
export class ChatsUserGuard implements CanActivate {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  /**
   * Checks user is the owner of the chat.
   * Must be used on URLs that have a chatId path param.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const chatId = request.params.chatId;

    if (!chatId) {
      throw new UnauthorizedException('Missing chatId');
    }
    if (!uuidValidate(chatId)) {
      return false;
    }

    const user = request.user as AuthedUser;
    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const chatEntity = await this.chatMessagesService.getChatById(chatId);

    return user.id === chatEntity.userId;
  }
}
