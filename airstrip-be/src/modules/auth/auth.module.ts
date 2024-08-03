import { Module } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import {
  BEARER_STRATEGY_CONFIG,
  BearerStrategy,
  BearerStrategyConfig,
} from './bearer-strategy';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';
import * as fs from 'fs';
import {
  JWT_SERVICE_CONFIG,
  JwtService,
  JwtServiceConfig,
} from './jwt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordHashModule } from '../password-hash/password-hash.module';
import { UsersModule } from '../users/users.module';
import { EnvVariables } from '../../utils/constants/env';

@Module({
  imports: [PasswordHashModule, UsersModule],
  providers: [
    {
      provide: BEARER_STRATEGY_CONFIG,
      useFactory: async (
        configService: ConfigService,
      ): Promise<BearerStrategyConfig> => {
        const appJwtSignAlg = configService.getOrThrow<string>(
          EnvVariables.AIRSTRIP_JWT_SIGN_ALG,
        );
        const pubKeyFile = configService.getOrThrow<string>(
          EnvVariables.AIRSTRIP_JWT_PUBLIC_JWK,
        );
        const pubJwk = (await jose.importJWK(
          JSON.parse(fs.readFileSync(pubKeyFile, 'utf-8')),
          appJwtSignAlg,
        )) as jose.KeyLike;
        const appJwtPubKey = await jose.exportSPKI(pubJwk);

        return {
          appJwtPubKey,
          appJwtSignAlg,
        };
      },
      inject: [ConfigService],
    },
    {
      provide: JWT_SERVICE_CONFIG,
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtServiceConfig> => {
        const jwkFile = configService.getOrThrow<string>(
          EnvVariables.AIRSTRIP_JWT_PRIVATE_JWK,
        );
        const alg = configService.getOrThrow<string>(
          EnvVariables.AIRSTRIP_JWT_SIGN_ALG,
        );
        const privateKey = await jose.importJWK(
          JSON.parse(fs.readFileSync(jwkFile, 'utf-8')),
          alg,
        );

        return {
          appJwtPrivateKey: privateKey,
          appJwtSignAlg: alg,
        };
      },
      inject: [ConfigService],
    },
    LocalStrategy,
    BearerStrategy,
    JwtService,
    AuthService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
