import {
  CreateChatWithFirstMessageReq,
  CreateChatWithFirstMessageResp,
  SaveChatMessageReq,
  SaveChatMessageResp,
} from '@/utils/backend/client/chat-messages/types';
import { makePostRequest } from '@/utils/backend/utils';

export async function createNewChatWithFirstMessage({
  appId,
  authToken,
  body,
}: {
  appId: string;
  authToken: string;
  body: CreateChatWithFirstMessageReq;
}) {
  return await makePostRequest<
    CreateChatWithFirstMessageReq,
    CreateChatWithFirstMessageResp
  >({
    endpoint: `/api/v1/apps/${appId}/chats`,
    authToken,
    body,
  });
}

export async function saveChatMessage({
  chatId,
  authToken,
  body,
}: {
  chatId: string;
  authToken: string;
  body: SaveChatMessageReq;
}) {
  return await makePostRequest<SaveChatMessageReq, SaveChatMessageResp>({
    endpoint: `/api/v1/chats/${chatId}/messages`,
    authToken,
    body,
  });
}
