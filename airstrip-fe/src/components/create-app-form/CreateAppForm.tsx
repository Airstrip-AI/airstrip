'use client';

import { useCreateApp } from '@/hooks/queries/apps';
import { AppResp, CreateAppReq } from '@/utils/backend/client/apps/types';
import { AppType } from '@/utils/backend/client/common/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import { Select, TextInput, Flex, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function CreateAppForm({
  onAdd,
  teams,
  orgId,
}: {
  orgId: string;
  teams: { teamId: string; name: string }[];
  onAdd: (app: AppResp) => void;
}) {
  const { mutate: createAppMutation, isLoading: isCreating } = useCreateApp({
    onSuccess: (resp) => {
      showSuccessNotification(`App ${resp.name} created.`);
      onAdd(resp);
    },
    onError: (error) => {
      showErrorNotification(error.message || 'An error occurred.');
    },
  });
  const form = useForm<CreateAppReq>({
    initialValues: {
      name: '',
      description: '',
      type: AppType.CHAT,
      teamId: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      description: (value) =>
        value.trim().length > 0 ? null : 'Description is required',
      type: (value) =>
        value === AppType.CHAT ? null : 'App type must be CHAT',
      // type: (value) =>
      //   Object.values(AppType).includes(value)
      //     ? null
      //     : 'A valid app type is required',
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        createAppMutation({
          orgId,
          body: {
            name: values.name.trim(),
            description: values.description.trim(),
            type: values.type,
            teamId: values.teamId?.trim() || null,
          },
        });
      })}
    >
      <TextInput
        mb="md"
        {...form.getInputProps('name')}
        placeholder="Name"
        label="Name"
        description="A descriptive name for the app"
      />
      <TextInput
        mb="md"
        {...form.getInputProps('description')}
        placeholder="Description"
        label="Description"
        description="A brief description of the app would be helpful"
      />
      {/* Only Chat is supported now */}
      {/* <Select
        mb="md"
        {...form.getInputProps('type')}
        data={Object.values(AppType).map((provider) => ({
          label: provider,
          value: provider,
        }))}
        placeholder="Select app type"
      /> */}
      <Select
        mb="md"
        label="Select team"
        placeholder="Type to search for team"
        data={[
          {
            value: '',
            label: 'Org-wide app',
          },
          ...(teams.map((team) => ({
            value: team.teamId,
            label: team.name,
          })) || []),
        ]}
        {...form.getInputProps('teamId')}
        searchable
      />
      <Flex justify="end">
        <Button type="submit" size="xs" disabled={isCreating}>
          Create
        </Button>
      </Flex>
    </form>
  );
}
