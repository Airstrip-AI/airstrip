import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { UsersService } from '../users/users.service';
import { UserWithOrgs } from '../users/types/service';
import { AuthedUser } from './types/service';
import { RegisterUserReq } from './types/api';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordHashService: PasswordHashService,
    private readonly usersService: UsersService,
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
