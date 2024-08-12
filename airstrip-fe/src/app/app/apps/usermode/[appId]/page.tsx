'use client';

import { useGetApp } from '@/hooks/queries/apps';
import { useParams } from 'next/navigation';
import Chat from '@/components/chat/Chat';
import { Card, Container, Group, Stack, Text } from '@mantine/core';

export default function AppUserModePage() {
  const { appId }: { appId: string } = useParams();

  const { data: app } = useGetApp({
    appId,
  });

  if (!app) {
    return null;
  }

  return (
    <Container>
      <Stack>
        <Group>
          <Text fw="bold">{app.name}</Text>
          <Text size="sm" c="dimmed">
            {app.description}
          </Text>
        </Group>
        <Card>
          <Chat app={app} id={null} />
        </Card>
      </Stack>
    </Container>
  );
}
