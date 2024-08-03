import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as uuidValidate } from 'uuid';
import { UserEntity } from './user.entity';
import { UserWithOrgs } from './types/service';
import { PasswordHashService } from '../password-hash/password-hash.service';
import { OrgsService } from '../orgs/orgs.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly passwordHashService: PasswordHashService,
    private readonly orgsService: OrgsService,
  ) {}

  async findUserByIdJoinOrgs(id: string): Promise<UserWithOrgs | null> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid user ID.');
    }

    const user = await this.usersRepository
      .createQueryBuilder('users')
      .where('users.id = :id', { id })
      .leftJoinAndSelect('users.userOrgs', 'userOrgs')
      .leftJoinAndSelect('userOrgs.org', 'org')
      .getOne();

    if (!user) {
      return null;
    }

    return user as UserWithOrgs;
  }

  async findOneByEmailJoinOrgs(email: string): Promise<UserWithOrgs | null> {
    const user = await this.usersRepository
      .createQueryBuilder('users')
      .where('lower(users.email) = :email', {
        email: email.trim().toLowerCase(),
      })
      .leftJoinAndSelect('users.userOrgs', 'userOrgs')
      .leftJoinAndSelect('userOrgs.org', 'org')
      .getOne();

    if (!user) {
      return null;
    }

    return user as UserWithOrgs;
  }

  async registerUser(registerUserReq: {
    email: string;
    password: string;
    firstName: string;
  }): Promise<void> {
    const email = registerUserReq.email.trim().toLowerCase();
    const password = registerUserReq.password.trim();
    const firstName = registerUserReq.firstName.trim();

    if (!email || !password || !firstName) {
      throw new BadRequestException('Email, password, and name are required.');
    }

    await this.usersRepository.manager.transaction(async (manager) => {
      const usersRepository = manager.getRepository(UserEntity);

      const existingUser = await usersRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException(`Email ${email} is already registered.`);
      }

      // for simplicity for now, just set to verified, no need to do email verification yet.
      const newUser = await usersRepository.save({
        email,
        passwordHash: await this.passwordHashService.hashPassword(password),
        firstName,
        verified: true,
        verifiedAt: new Date(),
      });

      const newOrg = await this.orgsService.createOrgAndAddUserAsOwner(
        `${firstName}'s Organization`,
        newUser.id,
        manager,
      );
    });
  }
}
