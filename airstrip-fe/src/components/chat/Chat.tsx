'use client';

import { getValidToken } from '@/hooks/helpers';
import { AppResp } from '@/utils/backend/client/apps/types';
import { getBackendUrl } from '@/utils/backend/utils';
import { Alert, Card, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import ChatList from '@/components/chat/ChatList';
import { ChatScrollAnchor } from '@/components/chat/ChatScrollAnchor';
import ChatPanel from '@/components/chat/ChatPanel';
import { useMediaQuery } from '@mantine/hooks';

export default function Chat({ app }: { app: AppResp }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setAuthToken(getValidToken());
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    isLoading,
    stop,
  } = useChat({
    api: new URL(`/api/v1/app-chats/stream/apps/${app.id}`, getBackendUrl())
      .href,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    keepLastMessageOnError: true,
  });

  const hasMessages = !!messages.length;

  if (!app.aiProvider?.provider) {
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
            aiProvider={app.aiProvider?.provider}
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
