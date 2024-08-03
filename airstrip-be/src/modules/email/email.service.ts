import { Inject, Injectable, Logger } from '@nestjs/common';
import { SendTransactionalEmailRequest } from './types/service';
import * as nodemailer from 'nodemailer';

export const EMAIL_SERVICE_CONFIG = 'EMAIL_SERVICE_CONFIG';

export type EmailServiceConfig = {
  smtpHost?: string;
  smtpPort?: number;
  smtpAuth?: {
    user: string;
    pass: string;
  };
  sender?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly transporter?: nodemailer.Transporter;

  constructor(
    @Inject(EMAIL_SERVICE_CONFIG) private readonly config: EmailServiceConfig,
  ) {
    if (
      this.config.smtpHost &&
      this.config.smtpPort &&
      this.config.smtpAuth &&
      this.config.sender
    ) {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465,
        auth: {
          user: this.config.smtpAuth.user,
          pass: this.config.smtpAuth.pass,
        },
      });
    }
  }

  async sendEmail(
    sendTransactionalEmailRequest: SendTransactionalEmailRequest,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured. Email not sent.');
      return;
    }

    const sendResponse = await this.transporter.sendMail({
      from: this.config.sender,
      to: sendTransactionalEmailRequest.to.map((r) => ({
        name: r.name || '',
        address: r.email,
      })),
      subject: sendTransactionalEmailRequest.subject,
      html: sendTransactionalEmailRequest.htmlContent,
    });

    this.logger.debug(sendResponse, 'Email send response');
  }
}
