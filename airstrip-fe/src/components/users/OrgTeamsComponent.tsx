'use client';

import AbstractDataTable from '@/components/abstract-data-table/AbstractDataTable';
import ActionDropdownButton from '@/components/action-dropdown-button/ActionDropdownButton';
import { roleColors } from '@/constants';
import { useCreateTeam, useGetOrgTeams } from '@/hooks/queries/org-teams';
import { OrgTeamResp } from '@/utils/backend/client/org-teams/types';
import {
  fromNow,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import {
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Pill,
  rem,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type OrgTeamsComponentProps = {
  orgId: string;
  hasOrgAdminPrivileges: boolean;
};

export default function OrgTeamsComponent({
  orgId,
  hasOrgAdminPrivileges,
}: OrgTeamsComponentProps) {
  const [
    createOrgTeamModalOpened,
    { open: openCreateOrgTeamModal, close: closeCreateOrgTeamModal },
  ] = useDisclosure(false);

  const [prevPageCursor, setPrevPageCursor] = useState<string | null>(null);
  const [page, setPage] = useState<string>('0');

  const router = useRouter();

  const { data, isLoading } = useGetOrgTeams({
    orgId,
    page,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const form = useForm<{ teamName: string }>({
    initialValues: {
      teamName: '',
    },
    validate: {
      teamName: (value) =>
        value.trim().length > 0 ? null : 'Team name is required',
    },
  });

  const { mutate: createOrgTeamMutation, isLoading: isCreating } =
    useCreateTeam({
      onSuccess: (resp: OrgTeamResp) => {
        showSuccessNotification(`Team ${resp.name} created successfully.`);
      },
      onError: (error) =>
        showErrorNotification(error.message || 'An error occurred.'),
    });

  const createOrgTeamModal = (
    <>
      <Modal
        opened={createOrgTeamModalOpened}
        onClose={closeCreateOrgTeamModal}
        title={<>Create team in organization</>}
        size="lg"
      >
        <form
          onSubmit={form.onSubmit((values) => {
            createOrgTeamMutation({
              orgId,
              body: {
                name: values.teamName,
              },
            });
            closeCreateOrgTeamModal();
          })}
        >
          <TextInput
            mb="md"
            {...form.getInputProps('teamName')}
            placeholder="Team name"
            label="Team name"
          />
          <Flex justify="end">
            <Button type="submit" size="xs" disabled={isCreating}>
              Create
            </Button>
          </Flex>
        </form>
      </Modal>
    </>
  );

  const columns = useMemo<MRT_ColumnDef<OrgTeamResp>[]>(
    () => [
      {
        header: 'Team',
        size: 300,
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
        accessorFn: (data) => (
          <Group>
            <Avatar color="cyan">
              {data.name
                .split(' ')
                .filter(Boolean)
                .map((v) => v.substring(0, 1).toUpperCase())
                .join('')}
            </Avatar>
            {data.name}
            <Badge
              color={
                data.authedUserRole ? roleColors[data.authedUserRole] : 'gray'
              }
            >
              {data.authedUserRole || 'Not a member'}
            </Badge>
            <Pill>
              {data.numMembers} {data.numMembers > 1 ? 'members' : 'member'}
            </Pill>
          </Group>
        ),
      },
      {
        header: 'Created',
        sortingFn: (a, b) =>
          new Date(a.original.createdAt).getTime() -
          new Date(b.original.createdAt).getTime(),
        accessorFn: (data) => fromNow(data.createdAt),
      },
      {
        header: 'Actions',
        enableSorting: false,
        enableColumnActions: false,
        accessorFn: (data: OrgTeamResp) => {
          return (
            <ActionDropdownButton
              basicActionMenuItems={
                hasOrgAdminPrivileges || data.authedUserRole
                  ? [
                      {
                        label: 'View team members',
                        onClick: () =>
                          router.push(`${Links.teams()}/${data.id}`),
                      },
                    ]
                  : [
                      {
                        label: 'Unable to view team members (not a member)',
                      },
                    ]
              }
              dangerActionMenuItems={[]}
            />
          );
        },
      },
    ],
    [hasOrgAdminPrivileges],
  );

  return (
    <Stack mb={rem(20)}>
      <Text fw="bold">Organization teams</Text>
      <AbstractDataTable
        columns={columns}
        data={data?.data || []}
        prevPageCursor={prevPageCursor}
        nextPageCursor={data?.nextPageCursor}
        isLoading={isLoading}
        loadPage={(cursor) => {
          const prevPage =
            Number(cursor) - 1 >= 0 ? String(Number(cursor) - 1) : null;
          setPrevPageCursor(prevPage);
          setPage(cursor);
        }}
        emptyRowsMessage={
          hasOrgAdminPrivileges
            ? `You haven't created any teams yet.`
            : `Your admins haven't created any teams yet.`
        }
      />
      {createOrgTeamModal}
      {hasOrgAdminPrivileges && (
        <Flex>
          <Button size="xs" variant="outline" onClick={openCreateOrgTeamModal}>
            Create team
          </Button>
        </Flex>
      )}
    </Stack>
  );
}
