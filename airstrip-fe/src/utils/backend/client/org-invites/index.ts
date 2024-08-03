import { MessageResp } from '@/utils/backend/client/common/types';
import {
  GetPendingOrgInvitesResp,
  OrgInvitesReq,
} from '@/utils/backend/client/org-invites/types';
import {
  makeDeleteRequest,
  makeGetRequest,
  makePostRequest,
} from '@/utils/backend/utils';

export async function getPendingOrgInvites({
  orgId,
  page,
  authToken,
}: {
  orgId: string;
  page: string;
  authToken: string;
}) {
  return await makeGetRequest<GetPendingOrgInvitesResp>({
    endpoint: `/api/v1/org-invites/orgs/${orgId}/pending?page=${page}`,
    authToken,
  });
}

export async function sendOrgInvites({
  orgId,
  authToken,
  body,
}: {
  orgId: string;
  authToken: string;
  body: OrgInvitesReq;
}) {
  return await makePostRequest<OrgInvitesReq, MessageResp>({
    endpoint: `/api/v1/org-invites/orgs/${orgId}`,
    authToken,
    body,
  });
}

export async function cancelOrgInvite({
  orgInviteId,
  authToken,
}: {
  orgInviteId: string;
  authToken: string;
}) {
  return await makeDeleteRequest<MessageResp>({
    endpoint: `/api/v1/org-invites/${orgInviteId}`,
    authToken,
  });
}
