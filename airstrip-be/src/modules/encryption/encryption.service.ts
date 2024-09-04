import { InfisicalClient } from '@infisical/sdk';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';

export const ENCRYPTION_SERVICE_CONFIG = 'ENCRYPTION_SERVICE_CONFIG';

export type EncryptionServiceConfig = {
  encryptionKey?: string;
  infisical?: {
    client: InfisicalClient;
    projectId: string;
    environment: string;
    secretName: string;
    path: string;
    type: string;
  };
};

const DELIMITER = '/';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-cbc';

  constructor(
    @Inject(ENCRYPTION_SERVICE_CONFIG)
    private readonly config: EncryptionServiceConfig,
  ) {}

  async encrypt(value: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(await this.getEncryptionKey(), 'hex'),
      iv,
    );
    let encrypted = cipher.update(Buffer.from(value));
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + DELIMITER + encrypted.toString('hex');
  }

  async decrypt(encryptedMessage: string): Promise<string> {
    const parts = encryptedMessage.split(DELIMITER);
    if (parts.length !== 2) {
      throw new InternalServerErrorException('Invalid encrypted payload');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedBuffer = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(await this.getEncryptionKey(), 'hex'),
      iv,
    );
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  private async getEncryptionKey(): Promise<string> {
    if (this.config.encryptionKey) {
      return this.config.encryptionKey;
    } else if (this.config.infisical) {
      const { client, projectId, environment, secretName, path, type } =
        this.config.infisical;
      return (
        await client.getSecret({
          environment,
          projectId,
          secretName,
          path,
          type,
        })
      ).secretValue;
    } else {
      throw new InternalServerErrorException(
        'Invalid encryption configuration',
      );
    }
  }
}
