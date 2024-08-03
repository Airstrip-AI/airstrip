import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { MessageResp } from '@/utils/backend/client/common/types';
import {
  acceptOrRejectOrgInvite,
  getPendingOrgInvitesForUser,
} from '@/utils/backend/client/user-org-invites';
import {
  AcceptOrRejectInviteReq,
  GetPendingUserOrgInvitesResp,
} from '@/utils/backend/client/user-org-invites/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function useGetPendingOrgInvitesForUser({
  onSuccess,
  onError,
}: {
  onSuccess?: (results: GetPendingUserOrgInvitesResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.USER_ORG_INVITES],
    queryFn: () => {
      const authToken = getValidToken();
      return getPendingOrgInvitesForUser({
        authToken,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}

export function useAcceptOrRejectOrgInvite({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: AcceptOrRejectInviteReq }) => {
      const authToken = getValidToken();
      return acceptOrRejectOrgInvite({
        authToken,
        body,
      });
    },
    onSuccess: (resp: MessageResp) => {
      queryClient.invalidateQueries([QueryKeys.USER_ORG_INVITES]);
      onSuccess(resp);
    },
    onError,
  });
}
