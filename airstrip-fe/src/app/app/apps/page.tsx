'use client';

import AbstractDataTable from '@/components/abstract-data-table/AbstractDataTable';
import ActionDropdownButton from '@/components/action-dropdown-button/ActionDropdownButton';
import { loadImage } from '@/components/ai-providers-image/helpers';
import CreateAppForm from '@/components/create-app-form/CreateAppForm';
import { useListAppsForUser } from '@/hooks/queries/apps';
import { useGetUserOrgTeams } from '@/hooks/queries/org-teams';
import { useCurrentUser } from '@/hooks/queries/user-auth';
import { activeOrgIdKey } from '@/hooks/user';
import { AppResp } from '@/utils/backend/client/apps/types';
import { fromNow, isAdminOrAbove, isAdminOrAboveInOrg } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import { Modal, Stack, rem, Text, Button, Flex } from '@mantine/core';
import { useDisclosure, readLocalStorageValue } from '@mantine/hooks';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

export default function AppsPage() {
  const router = useRouter();

  const [
    createAppModalOpened,
    { open: openCreateAppModal, close: closeCreateAppModal },
  ] = useDisclosure(false);

  const activeOrgId = readLocalStorageValue<string>({
    key: activeOrgIdKey,
  });

  const { currentUser } = useCurrentUser();
  const [hasOrgAdminPrivileges, setHasOrgAdminPrivileges] =
    useState<boolean>(false);

  const [hasAnyTeamAdminPrivileges, setHasAnyTeamAdminPrivileges] =
    useState<boolean>(false);

  const [prevPageCursor, setPrevPageCursor] = useState<string | null>(null);
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

  const columns = useMemo<MRT_ColumnDef<AppResp>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Description',
        accessorKey: 'description',
      },
      {
        header: 'Type',
        accessorKey: 'type',
      },
      {
        header: 'Last updated',
        sortingFn: (a, b) =>
          new Date(a.original.updatedAt).getTime() -
          new Date(b.original.updatedAt).getTime(),
        accessorFn: (data) => fromNow(data.updatedAt),
      },
      {
        header: 'Team',
        sortingFn: (a, b) => {
          const teamA = a.original.team?.name || 'Organization';
          const teamB = b.original.team?.name || 'Organization';
          return teamA.localeCompare(teamB);
        },
        accessorFn: (data) =>
          data.team?.name || (
            <Text fs="italic" size="sm" fw="700">
              Organization
            </Text>
          ),
      },
      {
        header: 'Using provider',
        sortingFn: (a, b) => {
          const providerA = a.original.aiProvider?.provider || '';
          const providerB = b.original.aiProvider?.provider || '';
          return providerA.localeCompare(providerB);
        },
        accessorFn: (data) => {
          const provider = data.aiProvider?.provider || '';
          if (!provider) {
            return '';
          }
          return loadImage(provider);
        },
      },
      {
        header: 'Actions',
        enableSorting: false,
        enableColumnActions: false,
        accessorFn: (data) => {
          return (
            <ActionDropdownButton
              basicActionMenuItems={[
                {
                  label: 'View/edit details',
                  onClick: () => router.push(`${Links.apps(data.id)}`),
                },
              ]}
              dangerActionMenuItems={[]}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <Stack mb={rem(20)}>
      <Text fw="bold">Apps</Text>
      <AbstractDataTable
        enableColumnActions={true}
        columns={columns}
        data={apps?.data || []}
        prevPageCursor={prevPageCursor}
        nextPageCursor={apps?.nextPageCursor}
        isLoading={isLoadingApps}
        loadPage={(cursor) => {
          const prevPage =
            Number(cursor) - 1 >= 0 ? String(Number(cursor) - 1) : null;
          setPrevPageCursor(prevPage);
          setPage(cursor);
        }}
      />
      {createAppModal}
      {(hasOrgAdminPrivileges || hasAnyTeamAdminPrivileges) && (
        <Flex>
          <Button size="xs" variant="outline" onClick={openCreateAppModal}>
            Create app
          </Button>
        </Flex>
      )}
    </Stack>
  );
}
