import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { UsersService } from '../users/users.service';
import { UserWithOrgs } from '../users/types/service';
import { AuthedUser } from './types/service';
import { RegisterUserReq } from './types/api';
import { EmailService } from '../email/email.service';
import { PRODUCT_NAME } from '../../utils/constants';

export const AUTH_SERVICE_CONFIG = 'AUTH_SERVICE_CONFIG';

export type AuthServiceConfig = {
  frontendUrl: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordHashService: PasswordHashService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    @Inject(AUTH_SERVICE_CONFIG) private readonly config: AuthServiceConfig,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthedUser | null> {
    const user = await this.usersService.findOneByEmailJoinOrgs(email);
    if (!user) {
      return null;
    }

    const passwordVerified = await this.passwordHashService.passwordIsCorrect(
      password,
      user.passwordHash,
    );

    if (!passwordVerified) {
      return null;
    }

    return this.userEntityToAuthedUser(user);
  }

  async getAuthedUserByIdOrThrow(id: string): Promise<AuthedUser> {
    const user = await this.usersService.findUserByIdJoinOrgs(id);
    if (!user) {
      throw new UnauthorizedException('No such user.');
    }

    return this.userEntityToAuthedUser(user);
  }

  async register(registerUserReq: RegisterUserReq): Promise<void> {
    await this.usersService.registerUser(registerUserReq);
  }

  async requestResetPassword(req: { email: string }): Promise<void> {
    const token = await this.usersService.requestResetPassword(req);
    if (token) {
      const resetLink = `${this.config.frontendUrl}/reset-password?reset-token=${token.token}&email=${encodeURIComponent(req.email)}`;
      await this.emailService.sendEmail({
        subject: `You requested to reset your password`,
        htmlContent: `<p>
Hi,
<br>
you requested to reset your password. To reset your password, please click on this <a href="${resetLink}">link</a> or copy and paste the following URL in your browser: ${resetLink}.
</p>
<p>
Do not share this link with anyone else. If you did not request to reset your password, you can ignore this email.
</p
<p>
Please note that this link is valid for ${token.expireHours} hours from the time of its creation. It will expire on ${token.expireTime.toUTCString()}.
</p>
<p>Sincerely,<br>${PRODUCT_NAME}</p>
`,
        to: [
          {
            email: req.email,
          },
        ],
      });
    }
  }

  async resetPassword(req: {
    email: string;
    token: string;
    password: string;
  }): Promise<void> {
    await this.usersService.resetPassword(req);
    // no need to send email confirmation for password reset, save on email sending and save user from email spam
  }

  private userEntityToAuthedUser(user: UserWithOrgs): AuthedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      orgs: user.userOrgs.map((uo) => ({
        id: uo.org.id,
        name: uo.org.name,
        role: uo.role,
      })),
    };
  }
}
