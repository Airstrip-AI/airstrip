import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { MessageResp } from '@/utils/backend/client/common/types';
import { changeUserRole, getOrgUsers } from '@/utils/backend/client/org-users';
import {
  ChangeUserRoleReq,
  GetOrgUsersResp,
} from '@/utils/backend/client/org-users/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function useGetOrgUsers({
  orgId,
  page,
  onSuccess,
  onError,
}: {
  orgId: string;
  page: string;
  onSuccess?: (results: GetOrgUsersResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.ORG_USERS, orgId, page],
    queryFn: () => {
      const authToken = getValidToken();
      return getOrgUsers({
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

export function useChangeUserRole({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      userId,
      body,
    }: {
      orgId: string;
      userId: string;
      body: ChangeUserRoleReq;
    }) => {
      const authToken = getValidToken();
      return changeUserRole({
        orgId,
        userId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: MessageResp) => {
      queryClient.invalidateQueries([QueryKeys.ORG_USERS]);
      onSuccess(resp);
    },
    onError,
  });
}
