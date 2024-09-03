import { getApp, updateApp } from '@/actions/apps';
import { checkOptionalFeatures } from '@/actions/optional-features';
import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { AppEntity } from '@/services/apps';
import {
  checkUserPrivilegesForApp,
  createApp,
  getAllowedAiProvidersForApp,
  listAppsForUser,
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
  onSuccess: (resp: AppEntity) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, body }: { appId: string; body: UpdateAppReq }) => {
      return updateApp({
        appId,
        body,
      });
    },
    onSuccess: (resp: AppEntity) => {
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
  onSuccess?: (results: AppEntity) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.APPS, appId],
    queryFn: async () => {
      const [optionalFeatures, appConfig] = await Promise.all([
        checkOptionalFeatures(),
        getApp(appId),
      ]);

      return {
        ...appConfig,
        memory: optionalFeatures.memoryAllowed && appConfig.memory,
      };
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
      if (!orgId) {
        return {
          data: [],
          nextPageCursor: null,
        };
      }
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

export function useOptionalFeatures() {
  return useQuery({
    queryKey: [QueryKeys.OPTIONAL_FEATURES],
    queryFn: () => {
      return checkOptionalFeatures();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
