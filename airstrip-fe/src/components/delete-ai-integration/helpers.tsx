import { AiIntegrationKeyResp } from '@/utils/backend/client/ai-integrations/types';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

export const showConfirmDeleteAiIntegrationModal = (
  aiIntegration: AiIntegrationKeyResp,
  onConfirm: () => void,
) => {
  modals.openConfirmModal({
    title: (
      <>
        Confirm delete AI integration <b>{aiIntegration.name}</b>?
      </>
    ),
    children: (
      <Text size="sm">
        This action cannot be undone. Existing apps using this integration will
        stop working until you assign a new AI integration for those apps. Are
        you sure you want to delete the AI integration{' '}
        <b>{aiIntegration.name}</b>?
      </Text>
    ),
    labels: { confirm: 'Yes', cancel: 'No' },
    cancelProps: { size: 'xs' },
    confirmProps: { color: 'red', size: 'xs' },
    onConfirm,
  });
};
