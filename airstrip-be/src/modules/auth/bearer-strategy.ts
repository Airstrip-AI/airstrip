import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthedUser } from './types/service';

export const BEARER_STRATEGY_CONFIG = 'BEARER_STRATEGY_CONFIG';

export type BearerStrategyConfig = {
  appJwtPubKey: string;
  appJwtSignAlg: string;
};

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(BEARER_STRATEGY_CONFIG)
    private readonly bearerStrategyConfig: BearerStrategyConfig,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: bearerStrategyConfig.appJwtPubKey,
      algorithms: [bearerStrategyConfig.appJwtSignAlg],
    });
  }

  async validate(payload: any): Promise<AuthedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token.');
    }

    return await this.authService.getAuthedUserByIdOrThrow(payload.sub);
  }
}
