import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { MessageResp } from '@/utils/backend/client/common/types';
import {
  addOrgTeamUsers,
  changeOrgTeamUserRole,
  createTeam,
  getOrgTeam,
  getOrgTeams,
  getOrgTeamUsers,
  getOrgUsersAndTeamMembershipDetails,
  getUserOrgTeams,
} from '@/utils/backend/client/org-teams';
import {
  AddOrgTeamUsersReq,
  ChangeOrgTeamUserRoleReq,
  CreateOrgTeamReq,
  GetOrgTeamsResp,
  GetOrgTeamUsersResp,
  GetOrgUserAndTeamMembershipResp,
  GetUserOrgTeamsResp,
  OrgTeamResp,
} from '@/utils/backend/client/org-teams/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function useCreateTeam({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: OrgTeamResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      body,
    }: {
      orgId: string;
      body: CreateOrgTeamReq;
    }) => {
      const authToken = getValidToken();
      return createTeam({
        orgId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: OrgTeamResp) => {
      queryClient.invalidateQueries([QueryKeys.ORG_TEAMS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useGetOrgTeams({
  orgId,
  pagination,
  onSuccess,
  onError,
}: {
  orgId: string;
  pagination: {
    page: string;
    fetchAll: boolean;
  };
  onSuccess?: (results: GetOrgTeamsResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [
      QueryKeys.ORG_TEAMS,
      orgId,
      `${pagination.page}-${pagination.fetchAll}`,
    ],
    queryFn: () => {
      const authToken = getValidToken();
      return getOrgTeams({
        orgId,
        authToken,
        pagination,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}

export function useGetOrgTeam({
  orgTeamId,
  onSuccess,
  onError,
}: {
  orgTeamId: string;
  onSuccess?: (results: OrgTeamResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.ORG_TEAMS, orgTeamId],
    queryFn: () => {
      const authToken = getValidToken();
      return getOrgTeam({
        orgTeamId,
        authToken,
      });
    },
    onSuccess,
    onError,
  });
}

export function useGetOrgTeamUsers({
  orgTeamId,
  page,
  onSuccess,
  onError,
}: {
  orgTeamId: string;
  page: string;
  onSuccess?: (results: GetOrgTeamUsersResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.ORG_TEAM_USERS, orgTeamId, page],
    queryFn: () => {
      const authToken = getValidToken();
      return getOrgTeamUsers({
        orgTeamId,
        authToken,
        page,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}

export function useGetOrgUsersAndTeamMembershipDetails({
  orgTeamId,
  pagination,
  searchTerm,
  onSuccess,
  onError,
}: {
  orgTeamId: string;
  pagination: {
    page: string;
    fetchAll: boolean;
  };
  searchTerm?: string;
  onSuccess?: (results: GetOrgUserAndTeamMembershipResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [
      QueryKeys.ORG_TEAM_ORG_USERS,
      orgTeamId,
      `${pagination.page}-${pagination.fetchAll}`,
      searchTerm || '',
    ],
    queryFn: () => {
      const authToken = getValidToken();
      return getOrgUsersAndTeamMembershipDetails({
        orgTeamId,
        authToken,
        pagination,
        searchTerm,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}

export function useAddOrgTeamUsers({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgTeamId,
      body,
    }: {
      orgTeamId: string;
      body: AddOrgTeamUsersReq;
    }) => {
      const authToken = getValidToken();
      return addOrgTeamUsers({
        orgTeamId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: MessageResp) => {
      queryClient.invalidateQueries([QueryKeys.ORG_TEAM_USERS]);
      queryClient.invalidateQueries([QueryKeys.ORG_TEAM_ORG_USERS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useChangeOrgTeamUserRole({
  onSuccess,
  onError,
}: {
  onSuccess: (resp: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgTeamId,
      body,
    }: {
      orgTeamId: string;
      body: ChangeOrgTeamUserRoleReq;
    }) => {
      const authToken = getValidToken();
      return changeOrgTeamUserRole({
        orgTeamId,
        authToken,
        body,
      });
    },
    onSuccess: (resp: MessageResp) => {
      queryClient.invalidateQueries([QueryKeys.ORG_TEAM_USERS]);
      queryClient.invalidateQueries([QueryKeys.ORG_TEAM_ORG_USERS]);
      onSuccess(resp);
    },
    onError,
  });
}

export function useGetUserOrgTeams({
  orgId,
  onSuccess,
  onError,
}: {
  orgId: string;
  onSuccess?: (results: GetUserOrgTeamsResp) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.USER_ORG_TEAMS, orgId],
    queryFn: () => {
      const authToken = getValidToken();
      return getUserOrgTeams({
        orgId,
        authToken,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}
