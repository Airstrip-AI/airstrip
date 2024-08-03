'use client';

import AbstractDataTable from '@/components/abstract-data-table/AbstractDataTable';
import ActionDropdownButton from '@/components/action-dropdown-button/ActionDropdownButton';
import { roleColors } from '@/constants';
import {
  useCancelOrgInvite,
  useGetPendingOrgInvites,
  useSendOrgInvites,
} from '@/hooks/queries/org-invites';
import { MessageResp, UserRole } from '@/utils/backend/client/common/types';
import { OrgInvite } from '@/utils/backend/client/org-invites/types';
import {
  fromNow,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import {
  Badge,
  Button,
  Flex,
  Modal,
  rem,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { MRT_ColumnDef } from 'mantine-react-table';
import { useMemo, useState } from 'react';

type OrgInvitesComponentProps = {
  orgId: string;
};

export default function OrgInvitesComponent({
  orgId,
}: OrgInvitesComponentProps) {
  const [
    inviteUsersModalOpened,
    { open: openInviteUsersModal, close: closeInviteUsersModal },
  ] = useDisclosure(false);

  const [prevPageCursor, setPrevPageCursor] = useState<string | null>(null);
  const [page, setPage] = useState<string>('0');

  const { data, isLoading } = useGetPendingOrgInvites({
    orgId,
    page,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const form = useForm<{ emails: string; role: UserRole }>({
    initialValues: {
      emails: '',
      role: '' as UserRole,
    },
    validate: {
      emails: (value) => {
        if (!value.trim()) {
          return 'Emails are required';
        }
        const invalidEmails = value
          .split(',')
          .map((v) => {
            if (!v.trim().includes('@')) {
              return v;
            }
          })
          .filter(Boolean)
          .join(', ');
        if (invalidEmails) {
          return `Invalid emails: ${invalidEmails}`;
        }
        return null;
      },
      role: (value) => {
        if (!Object.values(UserRole).includes(value)) {
          return 'Invalid role';
        }
        return null;
      },
    },
  });

  const { mutate: sendOrgInvitesMutation, isLoading: isSending } =
    useSendOrgInvites({
      onSuccess: (resp: MessageResp) => {
        showSuccessNotification(resp.message);
      },
      onError: (error) =>
        showErrorNotification(error.message || 'An error occurred.'),
    });

  const { mutate: cancelOrgInviteMutation } = useCancelOrgInvite({
    onSuccess: (resp: MessageResp) => {
      showSuccessNotification(resp.message);
    },
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const inviteUsersModal = (
    <>
      <Modal
        opened={inviteUsersModalOpened}
        onClose={closeInviteUsersModal}
        title={<>Invite users to organization</>}
        size="lg"
      >
        <form
          onSubmit={form.onSubmit((values) => {
            sendOrgInvitesMutation({
              orgId,
              body: {
                emails: values.emails.split(',').map((v) => v.trim()),
                role: values.role,
              },
            });
            closeInviteUsersModal();
          })}
        >
          <Select
            mb="md"
            {...form.getInputProps('role')}
            data={Object.values(UserRole).map((role) => ({
              label: role,
              value: role,
            }))}
            placeholder="Select user role"
            description="If you would like to invite users with different roles, please send separate invites."
          />
          <TextInput
            mb="md"
            {...form.getInputProps('emails')}
            placeholder="Emails"
            label="Emails"
            description="Separate emails with commas"
          />
          <Flex justify="end">
            <Button type="submit" size="xs" disabled={isSending}>
              Send invites
            </Button>
          </Flex>
        </form>
      </Modal>
    </>
  );

  const showConfirmCancelInviteModal = (orgInvite: OrgInvite) => {
    modals.openConfirmModal({
      title: (
        <>
          Cancel invite for <b>{orgInvite.email}</b>?
        </>
      ),
      children: (
        <Text size="sm">
          Are you sure you want to cancel the invite for{' '}
          <b>{orgInvite.email}</b>?
        </Text>
      ),
      labels: { confirm: 'Yes', cancel: 'No' },
      cancelProps: { size: 'xs' },
      confirmProps: { color: 'red', size: 'xs' },
      onConfirm: () => {
        cancelOrgInviteMutation({
          orgInviteId: orgInvite.id,
        });
      },
    });
  };

  const columns = useMemo<MRT_ColumnDef<OrgInvite>[]>(
    () => [
      {
        header: 'Email',
        accessorKey: 'email',
        size: 300,
      },
      {
        header: 'Role',
        accessorFn: (data) => (
          <Badge color={roleColors[data.role]}>{data.role}</Badge>
        ),
        size: 50,
      },
      {
        header: 'Sent',
        accessorFn: (data) => fromNow(data.sentAt),
        size: 50,
      },
      {
        header: 'Actions',
        enableSorting: false,
        enableColumnActions: false,
        accessorFn: (data: OrgInvite) => {
          return (
            <ActionDropdownButton
              basicActionMenuItems={[]}
              dangerActionMenuItems={[
                {
                  label: 'Cancel invite',
                  onClick: () => showConfirmCancelInviteModal(data),
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
        prevPageCursor={prevPageCursor}
        nextPageCursor={data?.nextPageCursor}
        isLoading={isLoading}
        loadPage={(cursor) => {
          const prevPage =
            Number(cursor) - 1 >= 0 ? String(Number(cursor) - 1) : null;
          setPrevPageCursor(prevPage);
          setPage(cursor);
        }}
        emptyRowsMessage="There are no outstanding invitations."
      />
      {inviteUsersModal}
      <Flex>
        <Button size="xs" variant="outline" onClick={openInviteUsersModal}>
          Invite organization member
        </Button>
      </Flex>
    </Stack>
  );
}
