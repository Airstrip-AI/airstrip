'use client';

import { loadImage } from '@/components/ai-providers-image/helpers';
import AppEditor from '@/components/app-editor';
import {
  useGetAllowedAiProvidersForApp,
  useUpdateApp,
} from '@/hooks/queries/apps';
import type { AppEntity } from '@/services/apps';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { AiProvider } from '@/utils/backend/client/common/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  CopyButton,
  Divider,
  Fieldset,
  Group,
  Pill,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconCheck, IconExternalLink, IconLink } from '@tabler/icons-react';

export default function UpdateAppForm({
  app,
  form,
  appUserModeLink,
  disabled,
}: {
  app: AppEntity;
  form: UseFormReturnType<UpdateAppReq>;
  appUserModeLink: string;
  disabled?: boolean;
}) {
  const { mutate: updateAppMutation } = useUpdateApp({
    onSuccess: (app) => {
      showSuccessNotification(`App ${app.name} updated.`);
      form.resetDirty();
    },
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        updateAppMutation({
          appId: app.id,
          body: {
            name: values.name.trim(),
            description: values.description.trim(),
            type: values.type,
            aiProviderId: values.aiProviderId || null,
            systemPrompt: values.systemPrompt || null,
            systemPromptJson: values.systemPromptJson || null,
            introductionMessage: values.introductionMessage || null,
            outputJsonSchema: values.outputJsonSchema || null,
            temperature: values.temperature,
            memory: values.memory,
            memoryQuery: values.memoryQuery,
          },
        });
      })}
    >
      <Stack>
        <Card withBorder p="xl" styles={{ root: { overflow: 'visible' } }}>
          <Stack gap="lg">
            <div>
              <Group
                wrap="nowrap"
                justify="space-between"
                // row-reverse to make tabbing from Name input go to next input instead of user mode buttons
                style={{ flexDirection: 'row-reverse' }}
              >
                <UserModeButtons appUserModeLink={appUserModeLink} />

                <TextInput
                  size="40"
                  fw="bold"
                  aria-label="App name"
                  {...form.getInputProps('name')}
                  placeholder="App Name"
                  variant="unstyled"
                  readOnly={disabled}
                  errorProps={{
                    fz: 'sm',
                  }}
                />
              </Group>

              <Box mt="xs">
                <AppAccessibility app={app} />
              </Box>
            </div>

            <TextInput
              aria-label="App description"
              {...form.getInputProps('description')}
              placeholder="App Description (not part of prompt)"
              variant="unstyled"
              size="lg"
              readOnly={disabled}
              styles={{
                input: {
                  color: 'var(--mantine-color-gray-6)',
                },
              }}
            />

            <Card withBorder mt={20}>
              <Textarea
                label="Introduction"
                aria-label="Introduction"
                {...form.getInputProps('introductionMessage')}
                placeholder="Hi there, I'm your trusty AI assistant, how may I help? (not part of prompt)"
                autosize
                maxRows={5}
                variant="unstyled"
                readOnly={disabled}
              />
            </Card>

            <Divider label="What does your AI do, and how?" my={20} />
          </Stack>

          <Box mx="-xl" mt={20}>
            <AppEditor appId={app.id} form={form} disabled={disabled} />
          </Box>
        </Card>

        <Fieldset>
          <AiProviderSelect form={form} appId={app.id} disabled={disabled} />
        </Fieldset>

        <Group justify="flex-end" display={disabled ? 'none' : undefined}>
          <Button
            size="xs"
            type="reset"
            onClick={form.reset}
            disabled={!form.isDirty()}
          >
            Reset
          </Button>

          <Button
            variant="outline"
            size="xs"
            type="submit"
            disabled={!form.isDirty()}
          >
            Update
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

function UserModeButtons({ appUserModeLink }: { appUserModeLink: string }) {
  return (
    <Group wrap="nowrap" gap={8}>
      <Button
        size="xs"
        component="a"
        target="_blank"
        href={appUserModeLink}
        variant="outline"
        rightSection={<IconExternalLink size="1em" />}
      >
        Live App
      </Button>

      <CopyButton value={appUserModeLink}>
        {({ copied, copy }) => (
          <Tooltip label="Copy live app link">
            <ActionIcon
              variant="outline"
              onClick={copy}
              color={copied ? 'teal' : undefined}
            >
              {copied ? <IconCheck size="1em" /> : <IconLink size="1em" />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}

function AppAccessibility({ app }: { app: AppEntity }) {
  return <Pill>{app.team?.name || 'Org-wide app'}</Pill>;
}

function AiProviderSelect({
  appId,
  form,
  disabled,
}: {
  appId: string;
  form: UseFormReturnType<UpdateAppReq>;
  disabled?: boolean;
}) {
  const { data: allowedAiProvidersForApp } = useGetAllowedAiProvidersForApp({
    appId: appId,
    onError: (error) =>
      showErrorNotification(
        error.message || 'Unable to fetch allowed AI providers for app.',
      ),
  });
  const aiProviderBoxData = [
    {
      label: '(unset)',
      value: '',
      provider: null,
    },
    ...(allowedAiProvidersForApp?.data.map((provider) => ({
      label: provider.name,
      value: provider.id,
      provider,
    })) || []),
  ];

  return (
    <Select
      label="AI Provider"
      {...form.getInputProps('aiProviderId')}
      data={aiProviderBoxData}
      readOnly={disabled}
      renderOption={({ option, checked }) => {
        const provider = (option as any).provider as {
          id: string;
          name: string;
          description: string;
          aiProvider: AiProvider;
        } | null;
        const label = provider ? (
          <Group>
            <Text size="sm" fw="bold">
              {provider.name}
            </Text>{' '}
            <Text size="sm" c="dimmed">
              {provider.description.substring(0, 100) + '...'}
            </Text>
          </Group>
        ) : (
          <Text size="sm">{option.label}</Text>
        );

        return (
          <Group flex="1" gap="xs">
            {provider ? loadImage(provider.aiProvider) : null}
            {label}
            {checked && (
              <IconCheck
                style={{ marginInlineStart: 'auto' }}
                {...{
                  stroke: 1.5,
                  color: 'currentColor',
                  opacity: 0.6,
                  size: 18,
                }}
              />
            )}
          </Group>
        );
      }}
    />
  );
}
