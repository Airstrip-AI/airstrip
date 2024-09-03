'use client';

import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs';
import { useGetApp } from '@/hooks/queries/apps';
import { showErrorNotification } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import { Stack, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import AppDetailsForm from './app-details-form';

export default function AppDetailsPage() {
  const { appId }: { appId: string } = useParams();
  const { data: app } = useGetApp({
    appId,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  if (!app) {
    return null;
  }

  return (
    <Stack>
      <Breadcrumbs items={[{ title: '< Apps', href: Links.apps() }]} />
      <Text fw="bold">{app.name}</Text>
      <AppDetailsForm app={app} />
    </Stack>
  );
}
