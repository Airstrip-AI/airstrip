'use client';

import { ModelSelect } from '@/app/app/apps/[appId]/model-select';
import { useCreateAiIntegration } from '@/hooks/queries/ai-integrations';
import { useGetOrgTeams } from '@/hooks/queries/org-teams';
import {
  AiIntegrationWithApiKeyResp,
  CreateAiIntegrationReq,
} from '@/utils/backend/client/ai-integrations/types';
import { AiProvider } from '@/utils/backend/client/common/types';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import { Button, Flex, PasswordInput, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export default function AddAiIntegrationForm({
  orgId,
  onAdd,
}: {
  orgId: string;
  onAdd: (aiIntegration: AiIntegrationWithApiKeyResp) => void;
}) {
  const { data } = useGetOrgTeams({
    orgId,
    pagination: {
      page: '0',
      fetchAll: true,
    },
  });

  const { mutate: createAiIntegrationMutation, isLoading: isAdding } =
    useCreateAiIntegration({
      onSuccess: (resp) => {
        showSuccessNotification(`AI integration ${resp.name} created.`);
        onAdd(resp);
      },
      onError: (error) =>
        showErrorNotification(error.message || 'An error occurred.'),
    });

  const form = useForm<CreateAiIntegrationReq>({
    initialValues: {
      restrictedToTeamId: '',
      name: '',
      description: '',
      aiProvider: '' as AiProvider,
      aiProviderApiKey: '',
      aiProviderApiUrl: '',
      aiModel: '',
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
      aiModel: (value) =>
        value.trim().length > 0 ? null : 'Model is required',
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        createAiIntegrationMutation({
          orgId,
          body: {
            restrictedToTeamId: values.restrictedToTeamId?.trim() || null,
            name: values.name.trim(),
            description: values.description.trim(),
            aiProvider: values.aiProvider,
            aiProviderApiKey: values.aiProviderApiKey.trim(),
            aiProviderApiUrl: values.aiProviderApiUrl?.trim() || null,
            aiModel: values.aiModel.trim(),
          },
        });
      })}
    >
      <Select
        mb="md"
        label="Select team"
        placeholder="Type to search for team"
        data={[
          {
            value: '',
            label: 'Org-wide integration',
          },
          ...(data?.data.map((team) => ({
            value: team.id,
            label: team.name,
          })) || []),
        ]}
        {...form.getInputProps('restrictedToTeamId')}
        searchable
      />
      <TextInput
        mb="md"
        {...form.getInputProps('name')}
        placeholder="Name"
        label="Name"
        description="A descriptive name for the AI integration"
      />
      <TextInput
        mb="md"
        {...form.getInputProps('description')}
        placeholder="Description"
        label="Description"
        description="A brief description of the AI integration would be helpful"
      />
      <Select
        mb="md"
        {...form.getInputProps('aiProvider')}
        data={Object.values(AiProvider).map((provider) => ({
          label: provider,
          value: provider,
        }))}
        placeholder="Select AI provider"
        description={`For self-hosted providers which are compatible with OpenAI's APIs, select '${AiProvider.OPENAI_COMPATIBLE}'. `}
      />
      <ModelSelect form={form} aiProvider={form.values.aiProvider} />
      <PasswordInput
        mb="md"
        {...form.getInputProps('aiProviderApiKey')}
        placeholder="API key"
        label="API key"
        description="The API key for the AI provider"
      />
      <TextInput
        mb="md"
        {...form.getInputProps('aiProviderApiUrl')}
        placeholder="API URL"
        label="API URL"
        description="Optional. The API URL for the AI provider. Leave blank if not applicable."
      />
      <Flex justify="end">
        <Button type="submit" size="xs" disabled={isAdding}>
          Add
        </Button>
      </Flex>
    </form>
  );
}
