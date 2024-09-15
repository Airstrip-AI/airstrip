'use client';

import ActionDropdownButton from '@/components/action-dropdown-button/ActionDropdownButton';
import { loadImage } from '@/components/ai-providers-image/helpers';
import CreateAppForm from '@/components/create-app-form/CreateAppForm';
import { useDeleteApp, useListAppsForUser } from '@/hooks/queries/apps';
import { useGetUserOrgTeams } from '@/hooks/queries/org-teams';
import { useCurrentUser } from '@/hooks/queries/user-auth';
import { activeOrgIdKey } from '@/hooks/user';
import { AppResp } from '@/utils/backend/client/apps/types';
import { fromNow, isAdminOrAbove, isAdminOrAboveInOrg } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import { notifyError, notifyOk } from '@/utils/notifications';
import {
  Box,
  Button,
  ButtonProps,
  Group,
  LoadingOverlay,
  Modal,
  rem,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import classes from './page.module.css';

const appButtonProps: ButtonProps = {
  variant: 'outline',
  p: 'md',
  classNames: {
    root: classes.appButton,
    label: classes.appButtonLabel,
  },
};

export default function AppsPage() {
  const router = useRouter();

  const [
    createAppModalOpened,
    { open: openCreateAppModal, close: closeCreateAppModal },
  ] = useDisclosure(false);

  const [activeOrgId] = useLocalStorage({
    key: activeOrgIdKey,
  });

  const { currentUser } = useCurrentUser();
  const [hasOrgAdminPrivileges, setHasOrgAdminPrivileges] =
    useState<boolean>(false);

  const [hasAnyTeamAdminPrivileges, setHasAnyTeamAdminPrivileges] =
    useState<boolean>(false);

  const [page, setPage] = useState<string>('0');

  const { data: apps, isLoading: isLoadingApps } = useListAppsForUser({
    orgId: activeOrgId,
    page,
  });

  const { data: userOrgTeams } = useGetUserOrgTeams({
    orgId: activeOrgId,
  });

  useEffect(() => {
    setHasOrgAdminPrivileges(isAdminOrAboveInOrg(activeOrgId, currentUser));
  }, [activeOrgId, currentUser]);

  useEffect(() => {
    if (userOrgTeams) {
      setHasAnyTeamAdminPrivileges(
        userOrgTeams.data.some((team) => isAdminOrAbove(team.role)),
      );
    }
  }, [userOrgTeams]);

  const createAppModal = (
    <>
      <Modal
        opened={createAppModalOpened}
        onClose={closeCreateAppModal}
        title={<>Create app</>}
        size="xl"
      >
        <CreateAppForm
          orgId={activeOrgId}
          teams={userOrgTeams?.data || []}
          onAdd={(app) => {
            closeCreateAppModal();
            router.push(Links.apps(app.id));
          }}
        />
      </Modal>
    </>
  );

  const canCreateApp = hasOrgAdminPrivileges || hasAnyTeamAdminPrivileges;
  const showEmptyPlaceholder = !canCreateApp && !apps?.data.length;
  const nextPageCursor = apps?.nextPageCursor;

  return (
    <Stack mb={rem(20)}>
      <Text fw="bold">Apps</Text>

      {showEmptyPlaceholder && (
        <Box w="100%" c="dimmed" ta="center" fz="sm">
          No apps available.
        </Box>
      )}

      <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }}>
        {canCreateApp && (
          <Button {...appButtonProps} onClick={openCreateAppModal}>
            <Group gap="xs">
              <IconPlus size="1em" />
              <span>New App</span>
            </Group>
          </Button>
        )}
        {apps?.data.map((app) => {
          return <AppCard key={app.id} app={app} />;
        })}
      </SimpleGrid>

      {!!nextPageCursor && (
        <Group justify="center">
          <Button onClick={() => setPage(nextPageCursor)}>Load More</Button>
        </Group>
      )}
      {createAppModal}
    </Stack>
  );
}

function AppCard({ app }: { app: AppResp }) {
  const {
    mutate: deleteApp,
    variables,
    isLoading: isDeletingApp,
  } = useDeleteApp({
    onSuccess: () => {
      notifyOk('App deleted');
    },
    onError: () => {
      notifyError('Failed to delete app. Please try again.');
    },
  });

  const router = useRouter();

  const { id, name, aiProvider, updatedAt } = app;
  const { provider } = aiProvider || {};

  const link = Links.apps(id);

  function onClick() {
    router.push(`${link}`);
  }

  function onDelete() {
    modals.openConfirmModal({
      title: 'Confirm delete',
      children: (
        <>
          Are you sure you want to delete this app? This action cannot be
          undone.
        </>
      ),
      labels: { confirm: 'Delete', cancel: 'Back' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteApp({ appId: id });
      },
    });
  }

  const deletionInProgress = variables?.appId === id && isDeletingApp;

  return (
    <Button
      component={Link}
      key={id}
      href={link}
      {...appButtonProps}
      style={{ pointerEvents: deletionInProgress ? 'none' : undefined }}
    >
      <Stack w="100%" h="100%" align="start" justify="space-between">
        <Group w="100%" wrap="nowrap">
          <Box mr="auto" fz="md" className={classes.appTitle}>
            {name}
          </Box>
          <ActionDropdownButton
            basicActionMenuItems={[
              {
                label: 'View/edit details',
                onClick,
              },
            ]}
            dangerActionMenuItems={[
              {
                leftSection: <IconTrash size="1em" />,
                label: 'Delete',
                onClick: onDelete,
              },
            ]}
          />
        </Group>
        {!!provider && <Box>{loadImage(provider)}</Box>}
        <Box ta="right" c="dimmed" fz="xs" fw="normal">
          {fromNow(updatedAt)}
        </Box>
      </Stack>
      <LoadingOverlay
        loaderProps={{ type: 'dots' }}
        visible={deletionInProgress}
        overlayProps={{ blur: 18 }}
      />
    </Button>
  );
}
