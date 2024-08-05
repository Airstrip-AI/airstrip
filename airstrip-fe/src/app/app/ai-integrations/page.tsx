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
import { AiIntegrationKeyResp } from '@/utils/backend/client/ai-integrations/types';
import { AiProvider } from '@/utils/backend/client/common/types';
import {
  fromNow,
  isAdminOrAboveInOrg,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import { Alert, Button, Flex, Modal, rem, Stack, Text } from '@mantine/core';
import { readLocalStorageValue, useDisclosure } from '@mantine/hooks';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { IconCode } from '@tabler/icons-react';
import { showConfirmDeleteAiIntegrationModal } from '@/components/delete-ai-integration/helpers';

export default function AiIntegrationsPage() {
  const router = useRouter();

  const [
    addAiIntegrationModalOpened,
    { open: openAddAiIntegrationModal, close: closeAddAiIntegrationModal },
  ] = useDisclosure(false);

  const activeOrgId = readLocalStorageValue<string>({
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

  const providerLogoSize = 20;
  const columns = useMemo<MRT_ColumnDef<AiIntegrationKeyResp>[]>(
    () => [
      {
        header: 'Provider',
        sortingFn: (a, b) =>
          a.original.aiProvider.localeCompare(b.original.aiProvider),
        size: providerLogoSize,
        accessorFn: (data) => {
          switch (data.aiProvider) {
            case AiProvider.OPENAI:
              return (
                <Image
                  alt="OpenAI"
                  src="/llm-provider-logos/openai.svg"
                  width={providerLogoSize}
                  height={providerLogoSize}
                />
              );
            case AiProvider.OPENAI_COMPATIBLE:
              return <IconCode size={providerLogoSize} />;
            case AiProvider.MISTRAL:
              return (
                <Image
                  alt="Mistral"
                  src="/llm-provider-logos/mistral.svg"
                  width={providerLogoSize}
                  height={providerLogoSize}
                />
              );
            case AiProvider.GOOGLE:
              return (
                <Image
                  alt="Google"
                  src="/llm-provider-logos/google.svg"
                  width={providerLogoSize}
                  height={providerLogoSize}
                />
              );
            case AiProvider.COHERE:
              return (
                <Image
                  alt="Cohere"
                  src="/llm-provider-logos/cohere.png"
                  width={providerLogoSize}
                  height={providerLogoSize}
                />
              );
            case AiProvider.ANTHROPIC:
              return (
                <Image
                  alt="Anthropic"
                  src="/llm-provider-logos/anthropic.svg"
                  width={providerLogoSize}
                  height={providerLogoSize}
                />
              );
            default:
              return <Text>{data.aiProvider}</Text>;
          }
        },
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
