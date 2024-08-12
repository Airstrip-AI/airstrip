import {
  RegisterUserReq,
  LoginReq,
  LoginResp,
  UserProfileResp,
  RequestResetPasswordReq,
  ResetPasswordReq,
} from '@/utils/backend/client/auth/types';
import { MessageResp } from '@/utils/backend/client/common/types';
import { makeGetRequest, makePostRequest } from '@/utils/backend/utils';

export async function register(
  registerReq: RegisterUserReq,
): Promise<MessageResp> {
  return await makePostRequest<RegisterUserReq, MessageResp>({
    endpoint: '/api/v1/register',
    body: registerReq,
  });
}

export async function login(loginReq: LoginReq): Promise<LoginResp> {
  return await makePostRequest<LoginReq, LoginResp>({
    endpoint: '/api/v1/login',
    body: loginReq,
  });
}

export async function getCurrentUser(authToken: string) {
  return await makeGetRequest<UserProfileResp>({
    endpoint: '/api/v1/me',
    authToken,
  });
}

export async function requestResetPassword(
  req: RequestResetPasswordReq,
): Promise<MessageResp> {
  return await makePostRequest<RequestResetPasswordReq, MessageResp>({
    endpoint: '/api/v1/request-reset-password',
    body: req,
  });
}

export async function resetPassword(
  resetPasswordReq: ResetPasswordReq,
): Promise<MessageResp> {
  return await makePostRequest<ResetPasswordReq, MessageResp>({
    endpoint: '/api/v1/reset-password',
    body: resetPasswordReq,
  });
}
