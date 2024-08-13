'use client';

import {
  useAddOrgTeamUsers,
  useGetOrgUsersAndTeamMembershipDetails,
} from '@/hooks/queries/org-teams';
import { UserRole } from '@/utils/backend/client/common/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import { Button, Flex, MultiSelect, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

export default function AddTeamUserSelect({
  orgTeamId,
  onAdd,
}: {
  orgTeamId: string;
  onAdd: () => void;
}) {
  const [searchValue, setSearchValue] = useState<string>('');

  const { data } = useGetOrgUsersAndTeamMembershipDetails({
    orgTeamId,
    pagination: {
      page: '0',
      fetchAll: true,
    },
    searchTerm: searchValue,
  });

  const addOrgTeamUsersMutation = useAddOrgTeamUsers({
    onSuccess: (message) => {
      showSuccessNotification(message.message);
      onAdd();
    },
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const form = useForm<{ userIds: string[]; role: UserRole }>({
    initialValues: {
      userIds: [],
      role: '' as UserRole,
    },
    validate: {
      userIds: (value) => {
        if (!value.length) {
          return 'Please select at least one user';
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

  return (
    <Stack>
      <form
        onSubmit={form.onSubmit((values) => {
          addOrgTeamUsersMutation.mutate({
            orgTeamId,
            body: {
              userIds: values.userIds,
              role: values.role,
            },
          });
        })}
      >
        <Select
          mb="md"
          {...form.getInputProps('role')}
          data={Object.values(UserRole).map((role) => ({
            label: role,
            value: role,
          }))}
          label="User role"
          placeholder="Select user role"
          description="If you would like to add members with different roles, please add them separately."
        />
        <MultiSelect
          mb="md"
          label="Select members"
          placeholder="Type to search for members"
          data={
            data?.data.map((u) => ({
              value: u.id,
              label: `${u.firstName} (${u.email})${u.teamRole ? ` (${u.teamRole})` : ''}`,
              disabled: !!u.teamRole,
            })) || []
          }
          {...form.getInputProps('userIds')}
          searchable
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
        <Flex justify="end">
          <Button type="submit" size="xs">
            Add members
          </Button>
        </Flex>
      </form>
    </Stack>
  );
}
