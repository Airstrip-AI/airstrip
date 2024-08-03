import { Module } from '@nestjs/common';
import {
  EMAIL_SERVICE_CONFIG,
  EmailService,
  EmailServiceConfig,
} from './email.service';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from '../../utils/constants/env';

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE_CONFIG,
      useFactory: async (
        configService: ConfigService,
      ): Promise<EmailServiceConfig> => {
        const port = configService.get<string>(EnvVariables.AIRSTRIP_SMTP_PORT)
          ? parseInt(
              configService.get<string>(EnvVariables.AIRSTRIP_SMTP_PORT)!,
            )
          : undefined;
        const user = configService.get<string>(EnvVariables.AIRSTRIP_SMTP_USER);
        const pass = configService.get<string>(
          EnvVariables.AIRSTRIP_SMTP_PASSWORD,
        );
        return {
          smtpHost: configService.get<string>(EnvVariables.AIRSTRIP_SMTP_HOST),
          smtpPort: !port || isNaN(port) ? undefined : port,
          smtpAuth:
            user && pass
              ? {
                  user,
                  pass,
                }
              : undefined,
          sender: configService.get<string>(EnvVariables.AIRSTRIP_EMAIL_SENDER),
        };
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
