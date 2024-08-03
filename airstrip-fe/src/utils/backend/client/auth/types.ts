import { UserRole } from '@/utils/backend/client/common/types';

export class UserProfileResp {
  id: string;
  email: string;
  firstName: string;
  orgs: {
    id: string;
    name: string;
    role: UserRole;
  }[];
}

export class LoginResp extends UserProfileResp {
  token: string;
}

export class RegisterUserReq {
  email: string;
  firstName: string;
  password: string;
}

export class LoginReq {
  email: string;
  password: string;
}

export class RequestResetPasswordReq {
  email: string;
}

export class ResetPasswordReq {
  email: string;
  token: string;
  password: string;
}
