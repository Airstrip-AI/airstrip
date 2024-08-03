import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthedUser } from './types/service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<AuthedUser> {
    const authedUser = await this.authService.validateUser(email, password);
    if (!authedUser) {
      throw new UnauthorizedException('Incorrect credentials.');
    }

    return authedUser;
  }
}
