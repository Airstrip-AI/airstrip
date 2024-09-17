'use client';

import { useCreateApp } from '@/hooks/queries/apps';
import type { AppEntity } from '@/services/apps';
import { CreateAppReq } from '@/services/apps/types';
import { AppType } from '@/utils/backend/client/common/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import {
  Button,
  ButtonProps,
  Collapse,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowNarrowLeft, IconFile } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './create-app-form.module.css';
import { useAppTemplates } from './use-app-templates';

const templateButtonProps: ButtonProps = {
  variant: 'outline',
  p: 'md',
  classNames: {
    root: classes.templateButton,
    label: classes.templateButtonLabel,
  },
};

export default function CreateAppForm({
  onAdd,
  teams,
  orgId,
}: {
  orgId: string;
  teams: { teamId: string; name: string }[];
  onAdd: (app: AppEntity) => void;
}) {
  const [showBlankForm, setShowBlankForm] = useState(false);

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
      systemPrompt: undefined,
      systemPromptJson: undefined,
      introductionMessage: undefined,
      temperature: undefined,
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

  const templates = useAppTemplates();

  function doSubmit(values: CreateAppReq) {
    createAppMutation({
      orgId,
      body: {
        name: values.name.trim(),
        description: values.description.trim(),
        type: values.type,
        teamId: values.teamId?.trim() || null,
        introductionMessage: values.introductionMessage?.trim(),
        systemPrompt: values.systemPrompt?.trim(),
        systemPromptJson: values.systemPromptJson,
        temperature: values.temperature,
      },
    });
  }

  return (
    <form onSubmit={form.onSubmit(doSubmit)}>
      <Select
        mb="md"
        label="Who can access this app?"
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

      {/* Blank app creation form: no template */}
      <Collapse in={showBlankForm}>
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

        <Group justify="space-between" mt="md">
          <Button
            variant="outline"
            size="xs"
            leftSection={<IconArrowNarrowLeft size="1em" />}
            onClick={() => setShowBlankForm(false)}
          >
            Back
          </Button>

          <Button type="submit" size="xs" loading={isCreating}>
            Create
          </Button>
        </Group>
      </Collapse>

      {/* App templates */}
      <Collapse in={!showBlankForm}>
        <Text c="dimmed" fz="sm" mb="sm">
          Use a template or start with a blank app.
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }}>
          <Button
            {...templateButtonProps}
            disabled={isCreating}
            onClick={() => setShowBlankForm(true)}
          >
            <Stack h="100%">
              <IconFile />
              <div>Blank App</div>
            </Stack>
          </Button>

          {templates?.map((template) => (
            <Button
              {...templateButtonProps}
              disabled={isCreating}
              key={template.name}
              onClick={() => {
                form.setFieldValue('name', template.name);
                form.setFieldValue('description', template.description);
                form.setFieldValue(
                  'introductionMessage',
                  template.introductionMessage || undefined,
                );
                form.setFieldValue(
                  'systemPrompt',
                  template.systemPrompt || undefined,
                );
                form.setFieldValue(
                  'systemPromptJson',
                  template.systemPromptJson || undefined,
                );
                form.setFieldValue('temperature', template.temperature);

                doSubmit(form.getValues());
              }}
            >
              <Stack h="100%">
                <template.icon />
                <div>{template.name}</div>
              </Stack>
            </Button>
          ))}
        </SimpleGrid>
      </Collapse>
    </form>
  );
}
