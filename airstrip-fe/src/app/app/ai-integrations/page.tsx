'use client';

import AbstractDataTable from '@/components/abstract-data-table/AbstractDataTable';
import ActionDropdownButton from '@/components/action-dropdown-button/ActionDropdownButton';
import AddAiIntegrationForm from '@/components/add-ai-integration-form/AddAiIntegrationForm';
import {
  useDeleteAiIntegration,
  useGetAiIntegrationsInOrg,
} from '@/hooks/queries/ai-integrations';
import { useCurrentUser } from '@/hooks/queries/user-auth';
import { activeOrgIdKey } from '@/hooks/user';
import { AiIntegrationResp } from '@/utils/backend/client/ai-integrations/types';
import {
  fromNow,
  isAdminOrAboveInOrg,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import { Alert, Button, Flex, Modal, rem, Stack, Text } from '@mantine/core';
import { useLocalStorage, useDisclosure } from '@mantine/hooks';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { showConfirmDeleteAiIntegrationModal } from '@/components/delete-ai-integration/helpers';
import { loadImage } from '@/components/ai-providers-image/helpers';

export default function AiIntegrationsPage() {
  const router = useRouter();

  const [
    addAiIntegrationModalOpened,
    { open: openAddAiIntegrationModal, close: closeAddAiIntegrationModal },
  ] = useDisclosure(false);

  const [activeOrgId] = useLocalStorage({
    key: activeOrgIdKey,
  });

  const { currentUser } = useCurrentUser();
  const [hasOrgAdminPrivileges, setHasOrgAdminPrivileges] =
    useState<boolean>(false);

  useEffect(() => {
    setHasOrgAdminPrivileges(isAdminOrAboveInOrg(activeOrgId, currentUser));
  }, [activeOrgId, currentUser]);

  const [prevPageCursor, setPrevPageCursor] = useState<string | null>(null);
  const [page, setPage] = useState<string>('0');

  const { data: aiIntegrations, isLoading: isLoadingAiIntegrations } =
    useGetAiIntegrationsInOrg({
      orgId: activeOrgId,
      page,
    });

  const { mutate: deleteAiIntegrationMutation } = useDeleteAiIntegration({
    onSuccess: (resp) => showSuccessNotification(resp.message),
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const addAiIntegrationModal = (
    <>
      <Modal
        opened={addAiIntegrationModalOpened}
        onClose={closeAddAiIntegrationModal}
        title={<>Add AI integration</>}
        size="xl"
      >
        <AddAiIntegrationForm
          orgId={activeOrgId}
          onAdd={() => closeAddAiIntegrationModal()}
        />
      </Modal>
    </>
  );

  const columns = useMemo<MRT_ColumnDef<AiIntegrationResp>[]>(
    () => [
      {
        header: 'Provider',
        sortingFn: (a, b) =>
          a.original.aiProvider.localeCompare(b.original.aiProvider),
        size: 20,
        accessorFn: (data) => loadImage(data.aiProvider),
      },
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Description',
        accessorKey: 'description',
      },
      {
        header: 'Last updated',
        sortingFn: (a, b) =>
          new Date(a.original.updatedAt).getTime() -
          new Date(b.original.updatedAt).getTime(),
        accessorFn: (data) => fromNow(data.updatedAt),
      },
      {
        header: 'For team',
        sortingFn: (a, b) => {
          const teamA = a.original.restrictedToTeam?.name || 'Organization';
          const teamB = b.original.restrictedToTeam?.name || 'Organization';
          return teamA.localeCompare(teamB);
        },
        accessorFn: (data) =>
          data.restrictedToTeam?.name || (
            <Text fs="italic" size="sm" fw="700">
              Organization
            </Text>
          ),
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
                  onClick: () =>
                    router.push(`${Links.aiIntegrations()}/${data.id}`),
                },
              ]}
              dangerActionMenuItems={[
                {
                  label: 'Delete AI integration',
                  onClick: () =>
                    showConfirmDeleteAiIntegrationModal(data, () =>
                      deleteAiIntegrationMutation({
                        aiIntegrationId: data.id,
                      }),
                    ),
                },
              ]}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <Stack mb={rem(20)}>
      <Text fw="bold">AI integrations</Text>
      {!hasOrgAdminPrivileges ? (
        <Alert color="red" variant="outline">
          Oops, you need to be an admin to view this page.
        </Alert>
      ) : (
        <>
          <AbstractDataTable
            enableColumnActions={true}
            columns={columns}
            data={aiIntegrations?.data || []}
            prevPageCursor={prevPageCursor}
            nextPageCursor={aiIntegrations?.nextPageCursor}
            isLoading={isLoadingAiIntegrations}
            loadPage={(cursor) => {
              const prevPage =
                Number(cursor) - 1 >= 0 ? String(Number(cursor) - 1) : null;
              setPrevPageCursor(prevPage);
              setPage(cursor);
            }}
          />
          {addAiIntegrationModal}
          {hasOrgAdminPrivileges && (
            <Flex>
              <Button
                size="xs"
                variant="outline"
                onClick={openAddAiIntegrationModal}
              >
                Add AI Integration
              </Button>
            </Flex>
          )}
        </>
      )}
    </Stack>
  );
}
