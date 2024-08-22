'use client';

import { loadImage } from '@/components/ai-providers-image/helpers';
import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs';
import {
  useCheckUserPrivilegesForApp,
  useGetAllowedAiProvidersForApp,
  useGetApp,
  useUpdateApp,
} from '@/hooks/queries/apps';
import { AppResp, UpdateAppReq } from '@/utils/backend/client/apps/types';
import { AiProvider, AppType } from '@/utils/backend/client/common/types';
import {
  isAdminOrAbove,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import {
  Button,
  Card,
  CopyButton,
  Flex,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconExternalLink } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { ModelSelect } from './model-select';

const formFieldLabel = (label: string) => (
  <Text fw="bold" size="sm">
    {label}
  </Text>
);

function AppDetailsForm({ app }: { app: AppResp }) {
  const { data: userAppPrivileges } = useCheckUserPrivilegesForApp({
    appId: app.id,
  });

  const form = useForm<UpdateAppReq>({
    initialValues: {
      name: app.name,
      description: app.description,
      type: app.type,
      aiProviderId: app.aiProvider?.id || '',
      systemPrompt: app.systemPrompt || '',
      introductionMessage: app.introductionMessage || '',
      outputJsonSchema: app.outputJsonSchema || '',
      aiModel: app.aiModel || '',
      temperature: app.temperature,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      description: (value) =>
        value.trim().length > 0 ? null : 'Description is required',
      type: (value) =>
        value === AppType.CHAT ? null : 'App type must be Chat',
      // type: (value) =>
      //   Object.values(AppType).includes(value)
      //     ? null
      //     : 'A valid app type is required',
      temperature: (value) =>
        value >= 0 && value <= 1 ? null : 'Temperature must be between 0 and 1',
    },
  });

  const { mutate: updateAppMutation } = useUpdateApp({
    onSuccess: (app) => {
      showSuccessNotification(`App ${app.name} updated.`);
    },
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const { data: allowedAiProvidersForApp } = useGetAllowedAiProvidersForApp({
    appId: app.id,
    onError: (error) =>
      showErrorNotification(
        error.message || 'Unable to fetch allowed AI providers for app.',
      ),
  });

  const appUserModeLink = new URL(
    Links.appUserMode(app.id),
    window.location.href,
  ).href;

  const canUpdateApp = userAppPrivileges?.accessLevel
    ? isAdminOrAbove(userAppPrivileges?.accessLevel)
    : false;

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

  return canUpdateApp ? (
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
            introductionMessage: values.introductionMessage || null,
            outputJsonSchema: values.outputJsonSchema || null,
            aiModel: values.aiModel?.trim() || null,
            temperature: values.temperature,
          },
        });
      })}
    >
      <Card withBorder padding="0">
        <Table withColumnBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td width="20%">
                {formFieldLabel('User mode link')}
              </Table.Td>
              <Table.Td>
                <Group>
                  <Button
                    size="xs"
                    component="a"
                    target="_blank"
                    href={appUserModeLink}
                    variant="outline"
                  >
                    <IconExternalLink />
                  </Button>
                  <CopyButton value={appUserModeLink}>
                    {({ copied, copy }) => (
                      <Button
                        variant="outline"
                        onClick={copy}
                        size="xs"
                        color={copied ? 'teal' : undefined}
                      >
                        {copied ? <IconCheck /> : 'Copy url'}
                      </Button>
                    )}
                  </CopyButton>
                </Group>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>{formFieldLabel('Team')}</Table.Td>
              <Table.Td>
                <TextInput value={app.team?.name || 'Org-wide app'} disabled />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>{formFieldLabel('Name')}</Table.Td>
              <Table.Td>
                <TextInput {...form.getInputProps('name')} />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>{formFieldLabel('Description')}</Table.Td>
              <Table.Td>
                <TextInput {...form.getInputProps('description')} />
              </Table.Td>
            </Table.Tr>
            {/* Only Chat is supported now */}
            {/* <Table.Tr>
              <Table.Td>{formFieldLabel('Type')}</Table.Td>
              <Table.Td>
                <Select
                  mb="md"
                  {...form.getInputProps('type')}
                  data={Object.values(AppType).map((provider) => ({
                    label: provider,
                    value: provider,
                  }))}
                  placeholder="Select app type"
                />
              </Table.Td>
            </Table.Tr> */}
            <Table.Tr>
              <Table.Td>{formFieldLabel('AI Provider')}</Table.Td>
              <Table.Td>
                <Select
                  {...form.getInputProps('aiProviderId')}
                  data={aiProviderBoxData}
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
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              {/* TODO: improve the UX by making this a searchable+creatable combobox where the list of options will be set based on the AiProvider selected. */}
              <Table.Td>{formFieldLabel('Model')}</Table.Td>
              <Table.Td>
                <ModelSelect
                  form={form}
                  aiProvidersData={allowedAiProvidersForApp}
                />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>{formFieldLabel('Creativity')}</Table.Td>
              <Table.Td>
                <NumberInput
                  {...form.getInputProps('temperature')}
                  step={0.1}
                  min={0}
                  max={1}
                  description="The creativity of the AI. 0 is very predictable, 1 is very creative."
                />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>{formFieldLabel('Role')}</Table.Td>
              <Table.Td>
                <Textarea
                  minRows={15}
                  rows={15}
                  {...form.getInputProps('systemPrompt')}
                  description="Describe what your AI does and how to do it."
                />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>{formFieldLabel('Introduction')}</Table.Td>
              <Table.Td>
                <Textarea
                  minRows={7}
                  rows={7}
                  {...form.getInputProps('introductionMessage')}
                  description="A message to introduce the AI to users. Usage examples perhaps?"
                />
              </Table.Td>
            </Table.Tr>
            {/* Not supported yet */}
            {/* <Table.Tr>
              <Table.Td>{formFieldLabel('Output JSON schema')}</Table.Td>
              <Table.Td>
                <Textarea
                  minRows={15}
                  rows={15}
                  {...form.getInputProps('outputJsonSchema')}
                  description="For Tool only. Describe the JSON schema of the output."
                />
              </Table.Td>
            </Table.Tr> */}
          </Table.Tbody>
        </Table>
      </Card>
      <Flex justify="end" pt="md">
        <Group>
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
      </Flex>
    </form>
  ) : (
    <Card withBorder padding="0">
      <Table withColumnBorders={false}>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td width="20%">{formFieldLabel('User mode link')}</Table.Td>
            <Table.Td>
              <Group>
                <Button
                  size="xs"
                  component="a"
                  target="_blank"
                  href={appUserModeLink}
                  variant="outline"
                >
                  <IconExternalLink />
                </Button>
                <CopyButton value={appUserModeLink}>
                  {({ copied, copy }) => (
                    <Button
                      variant="outline"
                      onClick={copy}
                      size="xs"
                      color={copied ? 'teal' : undefined}
                    >
                      {copied ? <IconCheck /> : 'Copy url'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>{formFieldLabel('Team')}</Table.Td>
            <Table.Td>
              <TextInput value={app.team?.name || 'Org-wide app'} disabled />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>{formFieldLabel('Name')}</Table.Td>
            <Table.Td>
              <TextInput {...form.getInputProps('name')} disabled />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  );
}

export default function AppDetailsPage() {
  const { appId }: { appId: string } = useParams();
  const { data: app } = useGetApp({
    appId,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  if (!app) {
    return null;
  }

  return (
    <Stack>
      <Breadcrumbs items={[{ title: '< Apps', href: Links.apps() }]} />
      <Text fw="bold">{app.name}</Text>
      <AppDetailsForm app={app} />
    </Stack>
  );
}
