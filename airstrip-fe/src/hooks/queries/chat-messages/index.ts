import { getValidToken, QueryKeys } from '@/hooks/helpers';
import {
  createNewChatWithFirstMessage,
  saveChatMessage,
} from '@/utils/backend/client/chat-messages';
import {
  CreateChatWithFirstMessageReq,
  CreateChatWithFirstMessageResp,
  SaveChatMessageReq,
  SaveChatMessageResp,
} from '@/utils/backend/client/chat-messages/types';
import { useMutation, useQueryClient } from 'react-query';

export function useCreateNewChatWithFirstMessage({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: CreateChatWithFirstMessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      body,
    }: {
      appId: string;
      body: CreateChatWithFirstMessageReq;
    }) => {
      const authToken = getValidToken();
      return createNewChatWithFirstMessage({
        appId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: CreateChatWithFirstMessageResp) => {
      queryClient.invalidateQueries([QueryKeys.CHATS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useSaveChatMessage({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: SaveChatMessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chatId,
      body,
    }: {
      chatId: string;
      body: SaveChatMessageReq;
    }) => {
      const authToken = getValidToken();
      return saveChatMessage({
        chatId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: SaveChatMessageResp) => {
      queryClient.invalidateQueries([QueryKeys.CHATS]);
      onSuccess(resp);
    },
    onError,
  });
}
