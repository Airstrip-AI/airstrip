import { MessageResp } from '@/utils/backend/client/common/types';
import {
  AcceptOrRejectInviteReq,
  GetPendingUserOrgInvitesResp,
} from '@/utils/backend/client/user-org-invites/types';
import { makeGetRequest, makePutRequest } from '@/utils/backend/utils';

export async function getPendingOrgInvitesForUser({
  authToken,
}: {
  authToken: string;
}) {
  return await makeGetRequest<GetPendingUserOrgInvitesResp>({
    endpoint: `/api/v1/user-org-invites`,
    authToken,
  });
}

export async function acceptOrRejectOrgInvite({
  authToken,
  body,
}: {
  authToken: string;
  body: AcceptOrRejectInviteReq;
}) {
  return await makePutRequest<AcceptOrRejectInviteReq, MessageResp>({
    endpoint: `/api/v1/user-org-invites`,
    authToken,
    body,
  });
}
