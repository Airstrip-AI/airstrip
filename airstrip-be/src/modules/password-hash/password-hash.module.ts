import { Module } from '@nestjs/common';
import { PasswordHashService } from './password-hash.service';

@Module({
  providers: [PasswordHashService],
  exports: [PasswordHashService],
})
export class PasswordHashModule {}
