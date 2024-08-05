import {
  AiIntegrationKeyResp,
  CreateAiIntegrationReq,
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
  return await makePostRequest<CreateAiIntegrationReq, AiIntegrationKeyResp>({
    endpoint: `/api/v1/ai-integrations/orgs/${orgId}`,
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
  return await makePutRequest<UpdateAiIntegrationReq, AiIntegrationKeyResp>({
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
  return await makeGetRequest<AiIntegrationKeyResp>({
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
    endpoint: `/api/v1/ai-integrations/orgs/${orgId}?page=${page}`,
    authToken,
  });
}

export async function listAiIntegrationsAccessibleByTeam({
  orgTeamId,
  authToken,
}: {
  orgTeamId: string;
  authToken: string;
}) {
  return await makeGetRequest<ListAiIntegrationsResp>({
    endpoint: `/api/v1/ai-integrations/org-teams/${orgTeamId}`,
    authToken,
  });
}
