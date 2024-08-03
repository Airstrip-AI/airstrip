import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { MessageResp } from '@/utils/backend/client/common/types';
import {
  cancelOrgInvite,
  getPendingOrgInvites,
  sendOrgInvites,
} from '@/utils/backend/client/org-invites';
import {
  GetPendingOrgInvitesResp,
  OrgInvitesReq,
} from '@/utils/backend/client/org-invites/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function useGetPendingOrgInvites({
  orgId,
  page,
  onSuccess,
  onError,
}: {
  orgId: string;
  page: string;
  onSuccess?: (results: GetPendingOrgInvitesResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.ORG_INVITES, orgId, page],
    queryFn: () => {
      const authToken = getValidToken();
      return getPendingOrgInvites({
        authToken,
        orgId,
        page,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}

export function useSendOrgInvites({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, orgId }: { body: OrgInvitesReq; orgId: string }) => {
      const authToken = getValidToken();
      return sendOrgInvites({
        orgId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: MessageResp) => {
      queryClient.invalidateQueries([QueryKeys.ORG_INVITES]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useCancelOrgInvite({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgInviteId }: { orgInviteId: string }) => {
      const authToken = getValidToken();
      return cancelOrgInvite({
        orgInviteId,
        authToken,
      });
    },
    onSuccess: (resp: MessageResp) => {
      queryClient.invalidateQueries([QueryKeys.ORG_INVITES]);
      onSuccess(resp);
    },
    onError,
  });
}
