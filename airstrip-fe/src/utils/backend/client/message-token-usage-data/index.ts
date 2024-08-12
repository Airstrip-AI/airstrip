import { MessageResp } from '@/utils/backend/client/common/types';
import { SaveMessageTokenUsageDataReq } from '@/utils/backend/client/message-token-usage-data/types';
import { makePostRequest } from '@/utils/backend/utils';

export async function saveUsageDataByClientGeneratedId({
  clientGeneratedId,
  authToken,
  body,
}: {
  clientGeneratedId: string;
  authToken: string;
  body: SaveMessageTokenUsageDataReq;
}) {
  return await makePostRequest<SaveMessageTokenUsageDataReq, MessageResp>({
    endpoint: `/api/v1/message-token-usage-data/save-by-client-generated-id/${clientGeneratedId}`,
    authToken,
    body,
  });
}
