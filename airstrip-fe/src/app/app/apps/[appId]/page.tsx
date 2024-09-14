'use client';

import BackButton from '@/components/back-button';
import { useGetApp } from '@/hooks/queries/apps';
import { showErrorNotification } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import { Group, Skeleton, Stack } from '@mantine/core';
import { useParams } from 'next/navigation';
import AppDetailsForm from './app-details-form';

export default function AppDetailsPage() {
  const { appId }: { appId: string } = useParams();
  const { data: app, isLoading } = useGetApp({
    appId,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  if (isLoading) {
    return (
      <Stack>
        <Skeleton width="100%" height={40} />
        <Skeleton width="100%" height="60vh" />
        <Skeleton width="100%" height={20} />
      </Stack>
    );
  }

  if (!app) {
    return null;
  }

  return (
    <Group>
      <Stack flex={1}>
        <div>
          <BackButton title="Apps" href={Links.apps()} />
        </div>
        <AppDetailsForm app={app} />
      </Stack>
    </Group>
  );
}
