'use client';

import AbstractDataTable from '@/components/abstract-data-table/AbstractDataTable';
import ActionDropdownButton from '@/components/action-dropdown-button/ActionDropdownButton';
import { roleColors } from '@/constants';
import {
  useAcceptOrRejectOrgInvite,
  useGetPendingOrgInvitesForUser,
} from '@/hooks/queries/user-org-invites';
import { UserOrgInvite } from '@/utils/backend/client/user-org-invites/types';
import {
  fromNow,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import { Badge, rem, Stack, Text } from '@mantine/core';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useMemo } from 'react';

export default function UserOrgInvitesComponent() {
  const { data, isLoading } = useGetPendingOrgInvitesForUser({
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const acceptOrRejectInviteMutation = useAcceptOrRejectOrgInvite({
    onSuccess: (message) => showSuccessNotification(message.message),
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const columns = useMemo<MRT_ColumnDef<UserOrgInvite>[]>(
    () => [
      {
        header: 'Organization',
        accessorKey: 'orgName',
      },
      {
        header: 'Role',
        sortingFn: (a, b) => a.original.role.localeCompare(b.original.role),
        accessorFn: (data) => (
          <Badge color={roleColors[data.role]}>{data.role}</Badge>
        ),
      },
      {
        header: 'Sent',
        sortingFn: (a, b) =>
          new Date(a.original.sentAt).getTime() -
          new Date(b.original.sentAt).getTime(),
        accessorFn: (data) => fromNow(data.sentAt),
      },
      {
        header: 'Actions',
        enableSorting: false,
        enableColumnActions: false,
        accessorFn: (data: UserOrgInvite) => {
          return (
            <ActionDropdownButton
              basicActionMenuItems={[
                {
                  label: 'Accept',
                  onClick: () =>
                    acceptOrRejectInviteMutation.mutate({
                      body: {
                        token: data.token,
                        accept: true,
                      },
                    }),
                },
              ]}
              dangerActionMenuItems={[
                {
                  label: 'Reject',
                  onClick: () =>
                    acceptOrRejectInviteMutation.mutate({
                      body: {
                        token: data.token,
                        accept: false,
                      },
                    }),
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
      <Text fw="bold">Pending invites</Text>
      <AbstractDataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyRowsMessage="There are no pending invitations."
      />
    </Stack>
  );
}
