import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHashService {
  private readonly rounds = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  async passwordIsCorrect(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
