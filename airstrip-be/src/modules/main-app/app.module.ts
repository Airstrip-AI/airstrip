import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '../../utils/exceptions-filter';
import { BearerAuthGuard } from '../auth/bearer-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { OrgsModule } from '../orgs/orgs.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerOptions } from 'typeorm';
import { EnvVariables } from '../../utils/constants/env';
import { OrgInvitesModule } from '../org-invites/org-invites.module';
import { UserOrgInvitesModule } from '../user-org-invites/user-org-invites.module';
import { OrgTeamsModule } from '../org-teams/org-teams.module';
import { AiIntegrationsModule } from '../ai-integrations/ai-integrations.module';
import { AppsModule } from '../apps/apps.module';
import { AppChatsModule } from '../app-chats/app-chats.module';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';
import { MessageTokenUsageDataModule } from '../message-token-usage-data/message-token-usage-data.module';

function getPostgresDbConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    synchronize: false, // never set true in production!
    autoLoadEntities: true,
    logging: configService.get<string>(
      EnvVariables.AIRSTRIP_SQL_LOGGING,
    ) as LoggerOptions,
    host: configService.get<string>(EnvVariables.AIRSTRIP_DB_HOST),
    port: configService.get<number>(EnvVariables.AIRSTRIP_DB_PORT),
    username: configService.get<string>(EnvVariables.AIRSTRIP_DB_USER),
    password: configService.get<string>(EnvVariables.AIRSTRIP_DB_PASSWORD),
    database: configService.get<string>(EnvVariables.AIRSTRIP_DB_NAME),
    ssl: configService.get<string>(EnvVariables.AIRSTRIP_DB_SSL_CERT)
      ? {
          rejectUnauthorized: true,
          ca: fs
            .readFileSync(
              configService.get<string>(EnvVariables.AIRSTRIP_DB_SSL_CERT)!,
            )
            .toString(),
        }
      : undefined,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getPostgresDbConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    OrgsModule,
    OrgInvitesModule,
    UserOrgInvitesModule,
    OrgTeamsModule,
    AiIntegrationsModule,
    AppsModule,
    AppChatsModule,
    ChatMessagesModule,
    MessageTokenUsageDataModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: 'APP_GUARD',
      useClass: BearerAuthGuard,
    },
  ],
})
export class AppModule {}
