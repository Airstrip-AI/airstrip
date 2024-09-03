'use client';

import { loadImage } from '@/components/ai-providers-image/helpers';
import {
  useGetAllowedAiProvidersForApp,
  useOptionalFeatures,
  useUpdateApp,
} from '@/hooks/queries/apps';
import type { AppEntity } from '@/services/apps';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { AiProvider } from '@/utils/backend/client/common/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import {
  Accordion,
  Box,
  Button,
  Card,
  Checkbox,
  CopyButton,
  Group,
  Select,
  Slider,
  Stack,
  Table,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import {
  IconCheck,
  IconDeviceSdCard,
  IconExternalLink,
} from '@tabler/icons-react';

export default function UpdateAppForm({
  app,
  form,
  appUserModeLink,
}: {
  app: AppEntity;
  form: UseFormReturnType<UpdateAppReq>;
  appUserModeLink: string;
}) {
  const { data: optionalFeatures } = useOptionalFeatures();

  const { data: allowedAiProvidersForApp } = useGetAllowedAiProvidersForApp({
    appId: app.id,
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
                  <TextInput
                    value={app.team?.name || 'Org-wide app'}
                    disabled
                  />
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
                <Table.Td>{formFieldLabel('Creativity')}</Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    The creativity of the AI. 0 is very predictable, 1 is very
                    creative.
                  </Text>
                  <Slider
                    {...form.getInputProps('temperature')}
                    min={0}
                    max={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 1, label: '1' },
                    ]}
                    step={0.1}
                    mb="lg"
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

        {!!optionalFeatures?.memoryAllowed && <MemorySection form={form} />}

        <Group justify="flex-end">
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

function MemorySection({ form }: { form: UseFormReturnType<UpdateAppReq> }) {
  const memoryInputProps = form.getInputProps('memory', { type: 'checkbox' });
  const enabled = memoryInputProps.checked;

  return (
    <Accordion defaultValue={enabled ? 'memory' : ''} variant="contained">
      <Accordion.Item value="memory">
        <Accordion.Control>
          <Group>
            <IconDeviceSdCard size="1em" />
            <Box>Assistant Memory</Box>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Box c="dimmed" fz="sm">
              <p>
                With Assistant memory, user preferences and points of interests
                can be stored and automatically used to provide context across
                different conversations with this app.
              </p>
              <p>
                This will provide users with a more personalized experience.
              </p>
              <Box component="p" fz="xs">
                (Note: AI token usage will increase when Assistant memory is
                enabled.)
              </Box>
            </Box>

            <Checkbox label="Enable" {...memoryInputProps} />

            <TagsInput
              label="What would be relevant?"
              {...form.getInputProps('memoryQuery')}
              acceptValueOnBlur
              disabled={!enabled}
              data={[
                'User preferences',
                'User role',
                'User responsibilities',
                "User's likes",
              ]}
              placeholder="Use comma (,) to separate tags"
              inputWrapperOrder={['label', 'input', 'description']}
              description={
                'Indicate what should be stored in the memory e.g. "user preferences". You can select from the list or type in a new tag.'
              }
            />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

const formFieldLabel = (label: string) => (
  <Text fw="bold" size="sm">
    {label}
  </Text>
);
