import {
  GetAllowedAiProvidersForAppResp,
  UpdateAppReq,
} from '@/utils/backend/client/apps/types';
import { Select } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useEffect, useMemo } from 'react';
import { models } from './models';

interface Props {
  form: UseFormReturnType<UpdateAppReq>;
  aiProvidersData?: GetAllowedAiProvidersForAppResp;
}

export function ModelSelect({ form, aiProvidersData }: Props) {
  const { aiProviderId } = form.values;

  const modelOptions = useMemo(() => {
    const providerData = aiProvidersData?.data.find(
      (data) => data.id === aiProviderId,
    );
    const modelList = providerData ? models[providerData.aiProvider] : [];

    return modelList;
  }, [aiProviderId]);

  useEffect(() => {
    form.setFieldValue('aiModel', modelOptions[0]);
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
