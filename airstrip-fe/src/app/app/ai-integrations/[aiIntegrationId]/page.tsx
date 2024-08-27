'use client';

import { ModelSelect } from '@/app/app/apps/[appId]/model-select';
import Breadcrumbs from '@/components/breadcrumbs/Breadcrumbs';
import { showConfirmDeleteAiIntegrationModal } from '@/components/delete-ai-integration/helpers';
import {
  useDeleteAiIntegration,
  useGetAiIntegration,
  useUpdateAiIntegration,
} from '@/hooks/queries/ai-integrations';
import {
  AiIntegrationKeyResp,
  UpdateAiIntegrationReq,
} from '@/utils/backend/client/ai-integrations/types';
import { AiProvider } from '@/utils/backend/client/common/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import {
  Button,
  Card,
  Divider,
  Flex,
  Group,
  PasswordInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useParams, useRouter } from 'next/navigation';

const formFieldLabel = (label: string) => (
  <Text fw="bold" size="sm">
    {label}
  </Text>
);

function AiIntegrationDetailsForm({
  aiIntegration,
}: {
  aiIntegration: AiIntegrationKeyResp;
}) {
  const router = useRouter();
  const form = useForm<UpdateAiIntegrationReq>({
    initialValues: {
      restrictedToTeamId: aiIntegration.restrictedToTeam?.id || '',
      name: aiIntegration.name,
      description: aiIntegration.description,
      aiProvider: aiIntegration.aiProvider,
      aiProviderApiUrl: aiIntegration.aiProviderApiUrl || '',
      aiProviderApiKey: aiIntegration.aiProviderApiKey,
      aiModel: aiIntegration.aiModel,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      description: (value) =>
        value.trim().length > 0 ? null : 'Description is required',
      aiProvider: (value) =>
        Object.values(AiProvider).includes(value)
          ? null
          : 'A valid AI provider is required',
      aiProviderApiKey: (value) =>
        value.trim().length > 0 ? null : 'API key is required',
    },
  });

  const { mutate: updateAiIntegrationMutation } = useUpdateAiIntegration({
    onSuccess: (resp) => {
      showSuccessNotification(`AI integration ${resp.name} updated.`);
      form.resetDirty();
    },
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  const { mutate: deleteAiIntegrationMutation } = useDeleteAiIntegration({
    onSuccess: (resp) => {
      showSuccessNotification(resp.message);
      router.push(Links.aiIntegrations());
    },
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  return (
    <>
      <Divider label="Basic details" />
      <form
        onSubmit={form.onSubmit((values) => {
          updateAiIntegrationMutation({
            aiIntegrationId: aiIntegration.id,
            body: {
              restrictedToTeamId: values.restrictedToTeamId?.trim() || null,
              name: values.name.trim(),
              description: values.description.trim(),
              aiProvider: values.aiProvider,
              aiProviderApiUrl: values.aiProviderApiUrl?.trim() || null,
              aiProviderApiKey: values.aiProviderApiKey,
              aiModel: values.aiModel,
            },
          });
        })}
      >
        <Card withBorder padding="0">
          <Table withColumnBorders>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td width="20%">{formFieldLabel('Name')}</Table.Td>
                <Table.Td>
                  <TextInput
                    {...form.getInputProps('name')}
                    description="A descriptive name for the AI integration"
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{formFieldLabel('Description')}</Table.Td>
                <Table.Td>
                  <TextInput
                    {...form.getInputProps('description')}
                    description="A brief description of the AI integration would be helpful"
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{formFieldLabel('AI Provider')}</Table.Td>
                <Table.Td>
                  <Select
                    {...form.getInputProps('aiProvider')}
                    data={Object.values(AiProvider).map((provider) => ({
                      label: provider,
                      value: provider,
                    }))}
                    description={`For self-hosted providers which are compatible with OpenAI's APIs, select '${AiProvider.OPENAI_COMPATIBLE}'. `}
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{formFieldLabel('Model')}</Table.Td>
                <Table.Td>
                  <ModelSelect
                    form={form}
                    aiProvider={form.values.aiProvider}
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{formFieldLabel('API key')}</Table.Td>
                <Table.Td>
                  <PasswordInput
                    {...form.getInputProps('aiProviderApiKey')}
                    description="The API key for the AI provider"
                  />
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{formFieldLabel('API URL')}</Table.Td>
                <Table.Td>
                  <TextInput
                    {...form.getInputProps('aiProviderApiUrl')}
                    description="Optional. The API URL for the AI provider. Leave blank if not applicable."
                  />
                </Table.Td>
              </Table.Tr>
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
      <Divider
        label={
          <Text c="red" fw="bold">
            Danger zone
          </Text>
        }
      />
      <Flex justify="center">
        <Button
          color="red"
          size="xs"
          onClick={() =>
            showConfirmDeleteAiIntegrationModal(aiIntegration, () =>
              deleteAiIntegrationMutation({
                aiIntegrationId: aiIntegration.id,
              }),
            )
          }
        >
          Delete AI integration
        </Button>
      </Flex>
    </>
  );
}

export default function AiIntegrationDetailsPage() {
  const { aiIntegrationId }: { aiIntegrationId: string } = useParams();
  const { data: aiIntegration } = useGetAiIntegration({
    aiIntegrationId,
    onError: (error) =>
      showErrorNotification(error.message || 'An error occurred.'),
  });

  if (!aiIntegration) {
    return null;
  }

  return (
    <Stack>
      <Breadcrumbs
        items={[{ title: '< AI integrations', href: Links.aiIntegrations() }]}
      />
      <Text fw="bold">{aiIntegration.name}</Text>
      <AiIntegrationDetailsForm aiIntegration={aiIntegration} />
    </Stack>
  );
}
