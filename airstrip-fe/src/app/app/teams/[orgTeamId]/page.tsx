'use client';

import AbstractDataTable from '@/components/abstract-data-table/AbstractDataTable';
import ActionDropdownButton, {
  ActionMenuItemProps,
} from '@/components/action-dropdown-button/ActionDropdownButton';
import AddTeamUserSelect from '@/components/add-team-user-select/AddTeamUserSelect';
import { roleColors } from '@/constants';
import {
  useChangeOrgTeamUserRole,
  useGetOrgTeam,
  useGetOrgTeamUsers,
} from '@/hooks/queries/org-teams';
import { useCurrentUser } from '@/hooks/queries/user-auth';
import { activeOrgIdKey } from '@/hooks/user';
import { UserRole } from '@/utils/backend/client/common/types';
import { OrgTeamUserResp } from '@/utils/backend/client/org-teams/types';
import {
  fromNow,
  isAdminOrAbove,
  isAdminOrAboveInOrg,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Pill,
  rem,
  Stack,
} from '@mantine/core';
import { readLocalStorageValue, useDisclosure } from '@mantine/hooks';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function TeamDetailsPage() {
  const [
    addMemberModalOpened,
    { open: openAddMemberModal, close: closeAddMemberModal },
  ] = useDisclosure(false);

  const { orgTeamId }: { orgTeamId: string } = useParams();
  const activeOrgId = readLocalStorageValue<string>({
    key: activeOrgIdKey,
  });

  const { currentUser } = useCurrentUser();
  const [hasOrgAdminPrivileges, setHasOrgAdminPrivileges] =
    useState<boolean>(false);

  useEffect(() => {
    setHasOrgAdminPrivileges(isAdminOrAboveInOrg(activeOrgId, currentUser));
  }, [activeOrgId, currentUser]);

  const { data: orgTeam, isLoading: isLoadingOrgTeam } = useGetOrgTeam({
    orgTeamId,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const [prevPageCursor, setPrevPageCursor] = useState<string | null>(null);
  const [page, setPage] = useState<string>('0');

  const { data: orgTeamUsers, isLoading: isLoadingOrgTeamUsers } =
    useGetOrgTeamUsers({
      orgTeamId,
      page,
      onError: (error) =>
        showErrorNotification(error.message || 'An error occurred.'),
    });

  const changeTeamUserRoleMutation = useChangeOrgTeamUserRole({
    onSuccess: (message) => showSuccessNotification(message.message),
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const hasTeamAdminPrivileges =
    orgTeam?.authedUserRole && isAdminOrAbove(orgTeam?.authedUserRole);

  const columns = useMemo<MRT_ColumnDef<OrgTeamUserResp>[]>(
    () => [
      {
        header: 'Member',
        accessorFn: (data) => (
          <>
            {data.userFirstName} ({data.userEmail})
          </>
        ),
      },
      {
        header: 'Role',
        accessorFn: (data) => (
          <Badge color={roleColors[data.role]}>{data.role}</Badge>
        ),
      },
      {
        header: 'Joined',
        accessorFn: (data) => fromNow(data.joinedTeamAt),
      },
      ...(hasOrgAdminPrivileges || hasTeamAdminPrivileges
        ? [
            {
              header: 'Actions',
              enableSorting: false,
              enableColumnActions: false,
              accessorFn: (data: OrgTeamUserResp) => {
                const noChangeOwnselfItem: ActionMenuItemProps = {
                  label: 'You cannot change your own access level',
                };
                const noChangeOwnerItem: ActionMenuItemProps = {
                  label: 'You cannot change the access level of the owner',
                };
                const downgradeToAdminItem: ActionMenuItemProps = {
                  label: 'Downgrade to Admin',
                  onClick: () => {
                    changeTeamUserRoleMutation.mutate({
                      orgTeamId,
                      body: { userId: data.userId, role: UserRole.ADMIN },
                    });
                  },
                };
                const downgradeToMemberItem: ActionMenuItemProps = {
                  label: 'Downgrade to Member',
                  onClick: () => {
                    changeTeamUserRoleMutation.mutate({
                      orgTeamId,
                      body: { userId: data.userId, role: UserRole.MEMBER },
                    });
                  },
                };
                const upgradeToOwnerItem: ActionMenuItemProps = {
                  label: 'Upgrade to Owner',
                  onClick: () => {
                    changeTeamUserRoleMutation.mutate({
                      orgTeamId,
                      body: { userId: data.userId, role: UserRole.OWNER },
                    });
                  },
                };
                const upgradeToAdminItem: ActionMenuItemProps = {
                  label: 'Upgrade to Admin',
                  onClick: () => {
                    changeTeamUserRoleMutation.mutate({
                      orgTeamId,
                      body: { userId: data.userId, role: UserRole.ADMIN },
                    });
                  },
                };

                let basicActionMenuItems: ActionMenuItemProps[] = [];
                let dangerActionMenuItems: ActionMenuItemProps[] = [];

                if (data.userId === currentUser!.id) {
                  basicActionMenuItems = [noChangeOwnselfItem];
                  dangerActionMenuItems = [];
                } else if (data.role === UserRole.OWNER) {
                  if (
                    !hasOrgAdminPrivileges &&
                    orgTeam?.authedUserRole !== UserRole.OWNER
                  ) {
                    basicActionMenuItems = [noChangeOwnerItem];
                    dangerActionMenuItems = [];
                  } else {
                    basicActionMenuItems = [
                      downgradeToAdminItem,
                      downgradeToMemberItem,
                    ];
                  }
                } else if (data.role === UserRole.ADMIN) {
                  if (
                    hasOrgAdminPrivileges ||
                    orgTeam?.authedUserRole === UserRole.OWNER
                  ) {
                    basicActionMenuItems = [
                      upgradeToOwnerItem,
                      downgradeToMemberItem,
                    ];
                  } else {
                    basicActionMenuItems = [downgradeToMemberItem];
                  }
                } else if (data.role === UserRole.MEMBER) {
                  if (
                    hasOrgAdminPrivileges ||
                    orgTeam?.authedUserRole === UserRole.OWNER
                  ) {
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
                    dangerActionMenuItems={[]}
                  />
                );
              },
            },
          ]
        : []),
    ],
    [hasTeamAdminPrivileges],
  );

  if (isLoadingOrgTeam) {
    return null;
  }

  const addMemberModal = (
    <>
      <Modal
        opened={addMemberModalOpened}
        onClose={closeAddMemberModal}
        title={<>Add member to {orgTeam?.name}</>}
        size="lg"
      >
        <AddTeamUserSelect orgTeamId={orgTeamId} onAdd={closeAddMemberModal} />
      </Modal>
    </>
  );

  return (
    <Stack mb={rem(20)}>
      <Group>
        <Avatar color="cyan">
          {orgTeam?.name
            .split(' ')
            .filter(Boolean)
            .map((v) => v.substring(0, 1).toUpperCase())
            .join('')}
        </Avatar>
        {orgTeam?.name}
        <Badge
          color={
            orgTeam?.authedUserRole
              ? roleColors[orgTeam.authedUserRole]
              : 'gray'
          }
        >
          {orgTeam?.authedUserRole || 'Not a member'}
        </Badge>
        <Pill>
          {orgTeam?.numMembers}{' '}
          {orgTeam?.numMembers && orgTeam?.numMembers > 1
            ? 'members'
            : 'member'}
        </Pill>
      </Group>

      {!orgTeam?.authedUserRole && !hasOrgAdminPrivileges ? (
        <Alert color="red" variant="outline">
          Oops, you need to be either a member of the team or an org admin to
          view team members.
        </Alert>
      ) : (
        <>
          <AbstractDataTable
            enableColumnActions={true}
            columns={columns}
            data={orgTeamUsers?.data || []}
            prevPageCursor={prevPageCursor}
            nextPageCursor={orgTeamUsers?.nextPageCursor}
            isLoading={isLoadingOrgTeamUsers}
            loadPage={(cursor) => {
              const prevPage =
                Number(cursor) - 1 >= 0 ? String(Number(cursor) - 1) : null;
              setPrevPageCursor(prevPage);
              setPage(cursor);
            }}
          />
          {addMemberModal}
          {(hasOrgAdminPrivileges || hasTeamAdminPrivileges) && (
            <Flex>
              <Button size="xs" variant="outline" onClick={openAddMemberModal}>
                Add member
              </Button>
            </Flex>
          )}
        </>
      )}
    </Stack>
  );
}
