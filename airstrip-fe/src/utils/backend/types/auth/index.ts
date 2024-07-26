export class UserProfileResp {
  id: string;
  email: string;
  firstName: string;
}

export class LoginResp extends UserProfileResp {
  token: string;
}

export class RegisterUserReq {
  email: string;
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
