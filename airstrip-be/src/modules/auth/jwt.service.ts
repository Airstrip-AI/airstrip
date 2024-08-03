import { Inject, Injectable } from '@nestjs/common';
import * as jose from 'jose';

export const JWT_SERVICE_CONFIG = 'JWT_SERVICE_CONFIG';

export type JwtServiceConfig = {
  appJwtPrivateKey: jose.KeyLike | Uint8Array;
  appJwtSignAlg: string;
};

@Injectable()
export class JwtService {
  constructor(
    @Inject(JWT_SERVICE_CONFIG)
    private readonly jwtServiceConfig: JwtServiceConfig,
  ) {}

  async createSignedJwt(payload: any): Promise<string> {
    return await new jose.SignJWT(payload)
      .setProtectedHeader({
        alg: this.jwtServiceConfig.appJwtSignAlg,
      })
      .setExpirationTime('7d')
      .setIssuer('app')
      .sign(this.jwtServiceConfig.appJwtPrivateKey);
  }
}
