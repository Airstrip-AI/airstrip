import {
  AiIntegrationWithApiKeyResp,
  CreateAiIntegrationReq,
  GetAllAiIntegrationsAccessibleByTeamResp,
  ListAiIntegrationsResp,
  UpdateAiIntegrationReq,
} from '@/utils/backend/client/ai-integrations/types';
import { MessageResp } from '@/utils/backend/client/common/types';
import {
  makeDeleteRequest,
  makeGetRequest,
  makePostRequest,
  makePutRequest,
} from '@/utils/backend/utils';

export async function createAiIntegration({
  orgId,
  authToken,
  body,
}: {
  orgId: string;
  authToken: string;
  body: CreateAiIntegrationReq;
}) {
  return await makePostRequest<
    CreateAiIntegrationReq,
    AiIntegrationWithApiKeyResp
  >({
    endpoint: `/api/v1/orgs/${orgId}/ai-integrations`,
    authToken,
    body,
  });
}

export async function updateAiIntegration({
  aiIntegrationId,
  authToken,
  body,
}: {
  aiIntegrationId: string;
  authToken: string;
  body: UpdateAiIntegrationReq;
}) {
  return await makePutRequest<
    UpdateAiIntegrationReq,
    AiIntegrationWithApiKeyResp
  >({
    endpoint: `/api/v1/ai-integrations/${aiIntegrationId}`,
    authToken,
    body,
  });
}

export async function deleteAiIntegration({
  aiIntegrationId,
  authToken,
}: {
  aiIntegrationId: string;
  authToken: string;
}) {
  return await makeDeleteRequest<MessageResp>({
    endpoint: `/api/v1/ai-integrations/${aiIntegrationId}`,
    authToken,
  });
}

export async function getAiIntegration({
  aiIntegrationId,
  authToken,
}: {
  aiIntegrationId: string;
  authToken: string;
}) {
  return await makeGetRequest<AiIntegrationWithApiKeyResp>({
    endpoint: `/api/v1/ai-integrations/${aiIntegrationId}`,
    authToken,
  });
}

export async function listAiIntegrationsInOrg({
  orgId,
  page,
  authToken,
}: {
  orgId: string;
  page: string;
  authToken: string;
}) {
  return await makeGetRequest<ListAiIntegrationsResp>({
    endpoint: `/api/v1/orgs/${orgId}/ai-integrations?page=${page}`,
    authToken,
  });
}

export async function getAllAiIntegrationsAccessibleByTeam({
  orgTeamId,
  authToken,
}: {
  orgTeamId: string;
  authToken: string;
}) {
  return await makeGetRequest<GetAllAiIntegrationsAccessibleByTeamResp>({
    endpoint: `/api/v1/org-teams/${orgTeamId}/ai-integrations`,
    authToken,
  });
}
