import { getValidToken } from '@/hooks/helpers';
import { MessageResp } from '@/utils/backend/client/common/types';
import { saveUsageDataByClientGeneratedId } from '@/utils/backend/client/message-token-usage-data';
import { SaveMessageTokenUsageDataReq } from '@/utils/backend/client/message-token-usage-data/types';
import { useMutation } from 'react-query';

export function useSaveUsageDataByClientGeneratedId({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: ({
      clientGeneratedId,
      body,
    }: {
      clientGeneratedId: string;
      body: SaveMessageTokenUsageDataReq;
    }) => {
      const authToken = getValidToken();
      return saveUsageDataByClientGeneratedId({
        clientGeneratedId,
        authToken,
        body,
      });
    },
    onSuccess,
    onError,
  });
}
