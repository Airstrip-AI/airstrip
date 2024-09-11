import { InjectableGuard } from '@/actions/auth.guard';
import * as chatsService from '@/services/chats';
import { UnauthorizedException } from '@/services/errors';
import { validate as uuidValidate } from 'uuid';

export function makeChatOwnerGuard(chatId: string): InjectableGuard {
  return async function (user) {
    if (!uuidValidate(chatId)) {
      return false;
    }

    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const chatEntity = await chatsService.getChatById(chatId);

    return user.id === chatEntity.userId;
  };
}
