import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';
import { PasswordHashModule } from '../password-hash/password-hash.module';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PasswordHashModule,
    OrgsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
