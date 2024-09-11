'use client';

import ChatList from '@/components/chat/ChatList';
import ChatPanel from '@/components/chat/ChatPanel';
import { ChatScrollAnchor } from '@/components/chat/ChatScrollAnchor';
import { getValidToken } from '@/hooks/helpers';
import {
  useCreateNewChatWithFirstMessage,
  useSaveChatMessage,
} from '@/hooks/queries/chat-messages';
import type { AppEntity } from '@/services/apps';
import { showErrorNotification } from '@/utils/misc';
import { Alert, Card, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { CompletionTokenUsage, Message } from 'ai';
import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import { saveMessageUsageData } from '../../actions/usage-data';
import { useCurrentUser } from '../../hooks/queries/user-auth';

export default function Chat({
  app,
  id: initialChatId,
}: {
  app: AppEntity;
  id: string | null;
}) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [usageData, setUsageData] = useState<Map<string, { finishReason: string; usage: CompletionTokenUsage; }>>(new Map());

  const { currentUser } = useCurrentUser();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    isLoading,
    stop,
  } = useChat({
    api: `/api/apps/${app.id}/stream-chat`,
    // api: new URL(`/api/v1/apps/${app.id}/stream-chat`, getBackendUrl()).href,
    // headers: {
    //   Authorization: `Bearer ${authToken}`,
    // },
    keepLastMessageOnError: true,
    onFinish: (message, options) =>
      setUsageData((prev) => {
        const newUsageData = new Map(prev);
        newUsageData.set(message.id, {
          finishReason: options.finishReason,
          usage: options.usage,
        });
        return newUsageData;
      }),
  });

  const { mutate: createNewChatMutation } = useCreateNewChatWithFirstMessage({
    onSuccess: (newChat) => {
      setChatId(newChat.chatId);
    },
    onError: (error) =>
      showErrorNotification(`Failed to create chat. Error: ${error.message}`),
  });
  const { mutate: saveChatMessageMutation } = useSaveChatMessage({
    onSuccess: (savedChatMessageResp) => {
      const { clientGeneratedId, id } = savedChatMessageResp;
      const messageUsageData = usageData.get(clientGeneratedId);
      if (!messageUsageData) {
        return;
      }

      saveMessageUsageData({
        chatMessageId: id,
        createdAt: new Date(),
        orgId: app.orgId,
        appId: app.id,
        userId: currentUser!.id,
        chatId: chatId!,
        aiProvider: app.aiProvider!.aiProvider,
        aiModel: app.aiProvider!.aiModel,
        completionTokens: messageUsageData.usage.completionTokens,
        promptTokens: messageUsageData.usage.promptTokens,
        totalTokens: messageUsageData.usage.totalTokens,
        status: messageUsageData.finishReason,
      }).then(() => {
        setUsageData((prev) => {
          const newUsageData = new Map(prev);
          newUsageData.delete(clientGeneratedId);
          return newUsageData;
        });
      }).catch((error) => console.error('Failed to save message usage data', error));

    },
    onError: (error) =>
      showErrorNotification(`Failed to save message. Error: ${error.message}`),
  });

  const saveMessage = (message: Message) => {
    const messagePayload = {
      role: message.role,
      clientGeneratedId: message.id,
      content: message.content,
      attachments: message.experimental_attachments || null,
      createdAt: message.createdAt || new Date(),
    };
    if (chatId) {
      saveChatMessageMutation({
        chatId,
        body: messagePayload,
      });
    } else {
      createNewChatMutation({
        appId: app.id,
        body: {
          firstMessage: messagePayload,
        },
      });
    }
  };

  useEffect(() => {
    setAuthToken(getValidToken());
  }, []);

  useEffect(() => {
    setChatId(initialChatId);
  }, [initialChatId]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      return;
    }
    if (messages.length > 1 && !chatId) {
      console.warn('Chat ID is not set, but there are multiple messages.');
    }
    if (lastMessage.role === 'user' || !isLoading) {
      saveMessage(lastMessage);
    }
  }, [messages, isLoading]);

  const hasMessages = !!messages.length;

  if (!app.aiProvider?.aiProvider) {
    return (
      <Alert color="red" variant="outline">
        This app does not have an AI provider set up. Please contact the admin
        to set up an AI provider.
      </Alert>
    );
  }

  return (
    <Stack h="100%" pt={hasMessages ? undefined : '10%'}>
      {hasMessages ? (
        <div style={{ paddingBottom: isSmallScreen ? '80px' : '200px' }}>
          <ChatList
            messages={messages}
            aiProvider={app.aiProvider?.aiProvider}
            error={error}
          />
          {/* BUG: doesn't scroll to bottom while text is printing on screen */}
          <ChatScrollAnchor trackVisibility={isLoading} />
        </div>
      ) : (
        <Card withBorder>
          <Text size="sm" fw="bold">
            Welcome!
          </Text>
          <Text size="sm">
            {app.introductionMessage ||
              'Looks like your admin has not set up an introduction message yet.'}
          </Text>
        </Card>
      )}
      <div
        style={{
          position: 'fixed',
          bottom: '0px',
          left: isSmallScreen ? '0px' : undefined,
          width: isSmallScreen ? '100%' : '50%',
        }}
      >
        <Card withBorder>
          <ChatPanel
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
          />
        </Card>
      </div>
    </Stack>
  );
}
