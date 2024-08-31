'use server';

import { currentUserJwtKey } from '@/hooks/user';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { makeGetRequest } from '@/utils/backend/utils';
import { Links } from '@/utils/misc/links';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type InjectableGuard = (user: UserProfileResp) => Promise<boolean>;

export async function authGuard(guards: InjectableGuard[]) {
  const authToken = cookies().get(currentUserJwtKey)?.value;

  if (!authToken) {
    redirectToLogin();
    return;
  }

  const user = await makeGetRequest<UserProfileResp>({
    endpoint: '/api/v1/me',
    authToken: authToken,
  });

  for (const guard of guards) {
    if (!(await guard(user))) {
      redirectToLogin();
      return;
    }
  }

  return {
    user,
    authToken,
  };
}

function redirectToLogin() {
  cookies().delete(currentUserJwtKey);

  redirect(Links.login());
}
