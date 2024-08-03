'use client';

import AbstractDataTable from '@/components/abstract-data-table/AbstractDataTable';
import ActionDropdownButton, {
  ActionMenuItemProps,
} from '@/components/action-dropdown-button/ActionDropdownButton';
import { roleColors } from '@/constants';
import { useChangeUserRole, useGetOrgUsers } from '@/hooks/queries/org-users';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { UserRole } from '@/utils/backend/client/common/types';
import { OrgUserResp } from '@/utils/backend/client/org-users/types';
import {
  fromNow,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import { Badge, Stack, Text } from '@mantine/core';
import { type MRT_ColumnDef } from 'mantine-react-table';
import { useMemo, useState } from 'react';

type MembersComponentProps = {
  orgId: string;
  hasOrgAdminPrivileges: boolean;
  currentUser: UserProfileResp;
  userRole: UserRole;
};

export default function OrgMembersComponent({
  orgId,
  hasOrgAdminPrivileges,
  currentUser,
  userRole,
}: MembersComponentProps) {
  const [prevPageCursor, setPrevPageCursor] = useState<string | null>(null);
  const [page, setPage] = useState<string>('0');

  const { data, isLoading } = useGetOrgUsers({
    orgId,
    page,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const changeUserRoleMutation = useChangeUserRole({
    onSuccess: (message) => showSuccessNotification(message.message),
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const columns = useMemo<MRT_ColumnDef<OrgUserResp>[]>(
    () => [
      {
        header: 'Member',
        accessorKey: 'firstName',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Role',
        accessorFn: (data) => (
          <Badge color={roleColors[data.role]}>{data.role}</Badge>
        ),
      },
      {
        header: 'Joined',
        accessorKey: 'joinedOrgAt',
        accessorFn: (data) => fromNow(data.joinedOrgAt),
      },
      ...(hasOrgAdminPrivileges
        ? [
            {
              header: 'Actions',
              enableSorting: false,
              enableColumnActions: false,
              accessorFn: (data: OrgUserResp) => {
                // extra check just in case
                if (!hasOrgAdminPrivileges) {
                  return null;
                }

                const noChangeOwnselfItem: ActionMenuItemProps = {
                  label: 'You cannot change your own access level',
                };
                const noChangeOwnerItem: ActionMenuItemProps = {
                  label: 'You cannot change the access level of the owner',
                };
                const downgradeToAdminItem: ActionMenuItemProps = {
                  label: 'Downgrade to Admin',
                  onClick: () => {
                    changeUserRoleMutation.mutate({
                      orgId,
                      userId: data.id,
                      body: { role: UserRole.ADMIN },
                    });
                  },
                };
                const downgradeToMemberItem: ActionMenuItemProps = {
                  label: 'Downgrade to Member',
                  onClick: () => {
                    changeUserRoleMutation.mutate({
                      orgId,
                      userId: data.id,
                      body: { role: UserRole.MEMBER },
                    });
                  },
                };
                const upgradeToOwnerItem: ActionMenuItemProps = {
                  label: 'Upgrade to Owner',
                  onClick: () => {
                    changeUserRoleMutation.mutate({
                      orgId,
                      userId: data.id,
                      body: { role: UserRole.OWNER },
                    });
                  },
                };
                const upgradeToAdminItem: ActionMenuItemProps = {
                  label: 'Upgrade to Admin',
                  onClick: () => {
                    changeUserRoleMutation.mutate({
                      orgId,
                      userId: data.id,
                      body: { role: UserRole.ADMIN },
                    });
                  },
                };

                let basicActionMenuItems: ActionMenuItemProps[] = [];
                let dangerActionMenuItems: ActionMenuItemProps[] = [];

                if (data.id === currentUser.id) {
                  basicActionMenuItems = [noChangeOwnselfItem];
                  dangerActionMenuItems = [];
                } else if (data.role === UserRole.OWNER) {
                  if (userRole !== UserRole.OWNER) {
                    basicActionMenuItems = [noChangeOwnerItem];
                    dangerActionMenuItems = [];
                  } else {
                    basicActionMenuItems = [
                      downgradeToAdminItem,
                      downgradeToMemberItem,
                    ];
                  }
                } else if (data.role === UserRole.ADMIN) {
                  if (userRole === UserRole.OWNER) {
                    basicActionMenuItems = [
                      upgradeToOwnerItem,
                      downgradeToMemberItem,
                    ];
                  } else {
                    basicActionMenuItems = [downgradeToMemberItem];
                  }
                } else if (data.role === UserRole.MEMBER) {
                  if (userRole === UserRole.OWNER) {
                    basicActionMenuItems = [
                      upgradeToOwnerItem,
                      upgradeToAdminItem,
                    ];
                  } else {
                    basicActionMenuItems = [upgradeToAdminItem];
                  }
                }
                return (
                  <ActionDropdownButton
                    basicActionMenuItems={basicActionMenuItems}
                    dangerActionMenuItems={dangerActionMenuItems}
                  />
                );
              },
            },
          ]
        : []),
    ],
    [hasOrgAdminPrivileges],
  );

  return (
    <Stack>
      <Text fw="bold">Organization members</Text>
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
        emptyRowsMessage="No members."
      />
    </Stack>
  );
}
