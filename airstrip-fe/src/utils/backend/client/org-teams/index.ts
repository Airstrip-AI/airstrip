import { MessageResp } from '@/utils/backend/client/common/types';
import {
  AddOrgTeamUsersReq,
  ChangeOrgTeamUserRoleReq,
  CreateOrgTeamReq,
  GetOrgTeamsResp,
  GetOrgTeamUsersResp,
  GetOrgUserAndTeamMembershipResp,
  OrgTeamResp,
} from '@/utils/backend/client/org-teams/types';
import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
} from '@/utils/backend/utils';

export async function createTeam({
  orgId,
  authToken,
  body,
}: {
  orgId: string;
  authToken: string;
  body: CreateOrgTeamReq;
}) {
  return await makePostRequest<CreateOrgTeamReq, OrgTeamResp>({
    endpoint: `/api/v1/org-teams/orgs/${orgId}`,
    authToken,
    body,
  });
}

export async function getOrgTeams({
  orgId,
  authToken,
  page,
}: {
  orgId: string;
  page: string;
  authToken: string;
}) {
  return await makeGetRequest<GetOrgTeamsResp>({
    endpoint: `/api/v1/org-teams/orgs/${orgId}?page=${page}`,
    authToken,
  });
}

export async function getOrgTeam({
  orgTeamId,
  authToken,
}: {
  orgTeamId: string;
  authToken: string;
}) {
  return await makeGetRequest<OrgTeamResp>({
    endpoint: `/api/v1/org-teams/${orgTeamId}`,
    authToken,
  });
}

export async function getOrgTeamUsers({
  orgTeamId,
  authToken,
  page,
}: {
  orgTeamId: string;
  page: string;
  authToken: string;
}) {
  return await makeGetRequest<GetOrgTeamUsersResp>({
    endpoint: `/api/v1/org-teams/${orgTeamId}/users?page=${page}`,
    authToken,
  });
}

export async function getOrgUsersAndTeamMembershipDetails({
  orgTeamId,
  authToken,
  page,
  searchTerm,
}: {
  orgTeamId: string;
  authToken: string;
  page: string;
  searchTerm?: string;
}) {
  return await makeGetRequest<GetOrgUserAndTeamMembershipResp>({
    endpoint: `/api/v1/org-teams/${orgTeamId}/org-users?page=${page}${searchTerm ? `&searchTerm=${searchTerm}` : ''}`,
    authToken,
  });
}

export async function addOrgTeamUsers({
  orgTeamId,
  authToken,
  body,
}: {
  orgTeamId: string;
  authToken: string;
  body: AddOrgTeamUsersReq;
}) {
  return await makePostRequest<AddOrgTeamUsersReq, MessageResp>({
    endpoint: `/api/v1/org-teams/${orgTeamId}/users`,
    authToken,
    body,
  });
}

export async function changeOrgTeamUserRole({
  orgTeamId,
  authToken,
  body,
}: {
  orgTeamId: string;
  authToken: string;
  body: ChangeOrgTeamUserRoleReq;
}) {
  return await makePutRequest<ChangeOrgTeamUserRoleReq, MessageResp>({
    endpoint: `/api/v1/org-teams/${orgTeamId}/users/change-role`,
    authToken,
    body,
  });
}
