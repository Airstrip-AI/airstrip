import { UserProfileResp } from '@/utils/backend/types/auth';
import { Links } from '@/utils/misc/links';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useQueryClient } from 'react-query';

export const currentUserJwtKey = 'currentUserJwt';

export function getUserAuthToken() {
  return getCookie(currentUserJwtKey) as string | undefined;
}

export function verifyAuthToken(authToken: string) {
  const token = jwtDecode(authToken);

  return !!token.exp && Date.now() < token.exp * 1000;
}

export function useLogin() {
  const router = useRouter();

  function login(
    _currentUser: UserProfileResp,
    authToken: string,
    redirectTo?: string,
  ) {
    setCookie(currentUserJwtKey, authToken, {
      sameSite: true,
    });
    router.push(redirectTo || Links.appHome());
  }

  return {
    login,
  };
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function logout() {
    deleteCookie(currentUserJwtKey, {
      sameSite: true,
    });
    queryClient.clear();
    router.push(Links.login());
  }

  return {
    logout,
  };
}
