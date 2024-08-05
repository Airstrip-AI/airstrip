import { getValidToken, QueryKeys } from '@/hooks/helpers';
import {
  createAiIntegration,
  deleteAiIntegration,
  getAiIntegration,
  listAiIntegrationsAccessibleByTeam,
  listAiIntegrationsInOrg,
  updateAiIntegration,
} from '@/utils/backend/client/ai-integrations';
import {
  AiIntegrationKeyResp,
  CreateAiIntegrationReq,
  ListAiIntegrationsResp,
  UpdateAiIntegrationReq,
} from '@/utils/backend/client/ai-integrations/types';
import { MessageResp } from '@/utils/backend/client/common/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function useCreateAiIntegration({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: AiIntegrationKeyResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      body,
    }: {
      orgId: string;
      body: CreateAiIntegrationReq;
    }) => {
      const authToken = getValidToken();
      return createAiIntegration({
        orgId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: AiIntegrationKeyResp) => {
      queryClient.invalidateQueries([QueryKeys.AI_INTEGRATIONS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useUpdateAiIntegration({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: AiIntegrationKeyResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      aiIntegrationId,
      body,
    }: {
      aiIntegrationId: string;
      body: UpdateAiIntegrationReq;
    }) => {
      const authToken = getValidToken();
      return updateAiIntegration({
        aiIntegrationId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: AiIntegrationKeyResp) => {
      queryClient.invalidateQueries([QueryKeys.AI_INTEGRATIONS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useDeleteAiIntegration({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ aiIntegrationId }: { aiIntegrationId: string }) => {
      const authToken = getValidToken();
      return deleteAiIntegration({
        aiIntegrationId,
        authToken,
      });
    },
    onSuccess: (resp: MessageResp) => {
      setTimeout(() => {
        queryClient.invalidateQueries([QueryKeys.AI_INTEGRATIONS]);
      }, 500);
      onSuccess(resp);
    },
    onError,
  });
}

export function useGetAiIntegration({
  aiIntegrationId,
  onSuccess,
  onError,
}: {
  aiIntegrationId: string;
  onSuccess?: (results: AiIntegrationKeyResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.AI_INTEGRATIONS, aiIntegrationId],
    queryFn: () => {
      const authToken = getValidToken();
      return getAiIntegration({
        aiIntegrationId,
        authToken,
      });
    },
    onSuccess,
    onError,
  });
}

export function useGetAiIntegrationsInOrg({
  orgId,
  page,
  onSuccess,
  onError,
}: {
  orgId: string;
  page: string;
  onSuccess?: (results: ListAiIntegrationsResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.AI_INTEGRATIONS, 'orgs', orgId, page],
    queryFn: () => {
      const authToken = getValidToken();
      return listAiIntegrationsInOrg({
        orgId,
        authToken,
        page,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}

export function useGetAiIntegrationsAccessibleByTeam({
  orgTeamId,
  onSuccess,
  onError,
}: {
  orgTeamId: string;
  onSuccess?: (results: ListAiIntegrationsResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.AI_INTEGRATIONS, 'org-teams', orgTeamId],
    queryFn: () => {
      const authToken = getValidToken();
      return listAiIntegrationsAccessibleByTeam({
        orgTeamId,
        authToken,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}
