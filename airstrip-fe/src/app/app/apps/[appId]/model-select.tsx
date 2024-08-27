import { Select } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useEffect, useMemo } from 'react';
import { models } from './models';
import {
  CreateAiIntegrationReq,
  UpdateAiIntegrationReq,
} from '@/utils/backend/client/ai-integrations/types';
import { AiProvider } from '@/utils/backend/client/common/types';

interface Props {
  form: UseFormReturnType<CreateAiIntegrationReq | UpdateAiIntegrationReq>;
  aiProvider: AiProvider;
}

export function ModelSelect({ form, aiProvider }: Props) {
  const modelOptions = useMemo(() => {
    return aiProvider ? models[aiProvider] : [];
  }, [aiProvider]);

  useEffect(() => {
    const aiModel = modelOptions.find((v) => v === form.values.aiModel);
    if (!aiModel) {
      form.setFieldValue('aiModel', modelOptions[0]);
    }
  }, [modelOptions]);

  return (
    <Select
      data={modelOptions}
      {...form.getInputProps('aiModel')}
      description="The AI model"
      allowDeselect={false}
    />
  );
}
