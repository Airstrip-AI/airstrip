import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { useLogout } from '@/hooks/user';
import {
  register,
  login,
  getCurrentUser,
  requestResetPassword,
  resetPassword,
} from '@/utils/backend/client/auth';
import {
  RegisterUserReq,
  LoginResp,
  LoginReq,
  RequestResetPasswordReq,
  ResetPasswordReq,
} from '@/utils/backend/client/auth/types';
import { MessageResp } from '@/utils/backend/client/common/types';
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

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.USER],
    queryFn: async () => {
      const authToken = getValidToken();
      const userProfile = await getCurrentUser(authToken);
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

export function useRequestResetPassword({
  onSuccess,
  onError,
}: {
  onSuccess: (results: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (body: RequestResetPasswordReq) => {
      return requestResetPassword(body);
    },
    onSuccess,
    onError,
  });
}

export function useResetPassword({
  onSuccess,
  onError,
}: {
  onSuccess: (results: MessageResp) => void;
  onError: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (body: ResetPasswordReq) => {
      return resetPassword(body);
    },
    onSuccess,
    onError,
  });
}
