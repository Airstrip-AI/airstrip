import {
  AppResp,
  CheckUserPrivilegesForAppResp,
  CreateAppReq,
  GetAllowedAiProvidersForAppResp,
  ListAppsResp,
  UpdateAppReq,
} from '@/utils/backend/client/apps/types';
import {
  makeGetRequest,
  makePostRequest,
  makePutRequest,
} from '@/utils/backend/utils';

export async function createApp({
  orgId,
  authToken,
  body,
}: {
  orgId: string;
  authToken: string;
  body: CreateAppReq;
}) {
  return await makePostRequest<CreateAppReq, AppResp>({
    endpoint: `/api/v1/orgs/${orgId}/apps`,
    authToken,
    body,
  });
}

export async function listAppsForUser({
  orgId,
  authToken,
  page,
}: {
  orgId: string;
  authToken: string;
  page: string;
}) {
  return await makeGetRequest<ListAppsResp>({
    endpoint: `/api/v1/orgs/${orgId}/apps?page=${page}`,
    authToken,
  });
}

export async function updateApp({
  appId,
  authToken,
  body,
}: {
  appId: string;
  authToken: string;
  body: UpdateAppReq;
}) {
  return await makePutRequest<UpdateAppReq, AppResp>({
    endpoint: `/api/v1/apps/${appId}`,
    authToken,
    body,
  });
}

export async function getApp({
  appId,
  authToken,
}: {
  appId: string;
  authToken: string;
}) {
  return await makeGetRequest<AppResp>({
    endpoint: `/api/v1/apps/${appId}`,
    authToken,
  });
}

export async function getAllowedAiProvidersForApp({
  appId,
  authToken,
}: {
  appId: string;
  authToken: string;
}) {
  return await makeGetRequest<GetAllowedAiProvidersForAppResp>({
    endpoint: `/api/v1/apps/${appId}/allowed-ai-providers`,
    authToken,
  });
}

export async function checkUserPrivilegesForApp({
  appId,
  authToken,
}: {
  appId: string;
  authToken: string;
}) {
  return await makeGetRequest<CheckUserPrivilegesForAppResp>({
    endpoint: `/api/v1/apps/${appId}/check-user-privileges`,
    authToken,
  });
}
