import { getValidToken, QueryKeys } from '@/hooks/helpers';
import {
  checkUserPrivilegesForApp,
  createApp,
  getAllowedAiProvidersForApp,
  getApp,
  listAppsForUser,
  updateApp,
} from '@/utils/backend/client/apps';
import {
  AppResp,
  CheckUserPrivilegesForAppResp,
  CreateAppReq,
  GetAllowedAiProvidersForAppResp,
  ListAppsResp,
  UpdateAppReq,
} from '@/utils/backend/client/apps/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function useCreateApp({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: AppResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, body }: { orgId: string; body: CreateAppReq }) => {
      const authToken = getValidToken();
      return createApp({
        orgId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: AppResp) => {
      queryClient.invalidateQueries([QueryKeys.APPS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useUpdateApp({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: AppResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, body }: { appId: string; body: UpdateAppReq }) => {
      const authToken = getValidToken();
      return updateApp({
        appId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: AppResp) => {
      queryClient.invalidateQueries([QueryKeys.APPS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useGetApp({
  appId,
  onSuccess,
  onError,
}: {
  appId: string;
  onSuccess?: (results: AppResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.APPS, appId],
    queryFn: () => {
      const authToken = getValidToken();
      return getApp({
        appId,
        authToken,
      });
    },
    onSuccess,
    onError,
  });
}

export function useListAppsForUser({
  orgId,
  page,
  onSuccess,
  onError,
}: {
  orgId: string;
  page: string;
  onSuccess?: (results: ListAppsResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.APPS, 'orgs', orgId, page],
    queryFn: () => {
      const authToken = getValidToken();
      return listAppsForUser({
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

export function useGetAllowedAiProvidersForApp({
  appId,
  onSuccess,
  onError,
}: {
  appId: string;
  onSuccess?: (results: GetAllowedAiProvidersForAppResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.AI_INTEGRATIONS, 'apps', appId],
    queryFn: () => {
      const authToken = getValidToken();
      return getAllowedAiProvidersForApp({
        appId,
        authToken,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}

export function useCheckUserPrivilegesForApp({
  appId,
  onSuccess,
  onError,
}: {
  appId: string;
  onSuccess?: (results: CheckUserPrivilegesForAppResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.USER_APP_PRIVILEGES, appId],
    queryFn: () => {
      const authToken = getValidToken();
      return checkUserPrivilegesForApp({
        appId,
        authToken,
      });
    },
    onSuccess,
    onError,
  });
}
