import { MessageResp } from '@/utils/backend/client/common/types';
import {
  ChangeUserRoleReq,
  GetOrgUsersResp,
} from '@/utils/backend/client/org-users/types';
import { makeGetRequest, makePutRequest } from '@/utils/backend/utils';

export async function getOrgUsers({
  orgId,
  page,
  authToken,
}: {
  orgId: string;
  page: string;
  authToken: string;
}) {
  return await makeGetRequest<GetOrgUsersResp>({
    endpoint: `/api/v1/orgs/${orgId}/users?page=${page}`,
    authToken,
  });
}

export async function changeUserRole({
  orgId,
  userId,
  authToken,
  body,
}: {
  orgId: string;
  userId: string;
  authToken: string;
  body: ChangeUserRoleReq;
}) {
  return await makePutRequest<ChangeUserRoleReq, MessageResp>({
    endpoint: `/api/v1/orgs/${orgId}/users/${userId}/change-role`,
    authToken,
    body,
  });
}
