import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { activeOrgIdKey, useLogout } from '@/hooks/user';
import { register, login, getCurrentUser } from '@/utils/backend/client/auth';
import {
  RegisterUserReq,
  LoginResp,
  LoginReq,
} from '@/utils/backend/client/auth/types';
import { MessageResp } from '@/utils/backend/client/common/types';
import { readLocalStorageValue, useLocalStorage } from '@mantine/hooks';
import { useMutation, useQuery } from 'react-query';

export function useRegister({
  onSuccess,
  onError,
}: {
  onSuccess: (results: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (body: RegisterUserReq) => {
      return register(body);
    },
    onSuccess,
    onError,
  });
}

export function useLogin({
  onSuccess,
  onError,
}: {
  onSuccess: (results: LoginResp) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (body: LoginReq) => {
      return login(body);
    },
    onSuccess,
    onError,
  });
}

export function useCurrentUser() {
  const { logout } = useLogout();
  const activeOrgId = readLocalStorageValue<string>({
    key: activeOrgIdKey,
  });
  //  the read value from useLocalStorage returns undefined even when a value is present, hence using readLocalStorageValue instead.
  const [_, setActiveOrgId] = useLocalStorage({
    key: activeOrgIdKey,
  });

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.USER],
    queryFn: async () => {
      const authToken = getValidToken();
      const userProfile = await getCurrentUser(authToken);
      if (
        !activeOrgId ||
        !userProfile.orgs.find((org) => org.id === activeOrgId)
      ) {
        setActiveOrgId(userProfile.orgs[0]?.id || '');
      }
      return userProfile;
    },
    onError() {
      logout();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    currentUser: data,
    loadingCurrentUser: isLoading,
  };
}
