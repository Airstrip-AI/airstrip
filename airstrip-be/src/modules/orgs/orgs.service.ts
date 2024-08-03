import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from './organization.entity';
import {
  EntityManager,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { OrgUserEntity } from './org-user.entity';
import { OrganizationUserWithUser } from './types/service';
import { UserRole, UserRoleOrder } from '../../utils/constants';
import { AuthedUser } from '../auth/types/service';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private orgsRepository: Repository<OrganizationEntity>,
    @InjectRepository(OrgUserEntity)
    private orgUsersRepository: Repository<OrgUserEntity>,
  ) {}

  async createOrgAndAddUserAsOwner(
    name: string,
    creatorId: string,
    entityManager?: EntityManager,
  ): Promise<OrganizationEntity> {
    const orgsRepository =
      entityManager?.getRepository(OrganizationEntity) || this.orgsRepository;

    const newOrg = await orgsRepository.save({
      name,
    });

    await this.addUserToOrg(
      newOrg.id,
      creatorId,
      UserRole.OWNER,
      entityManager,
    );

    return newOrg;
  }

  async addUserToOrg(
    orgId: string,
    userId: string,
    role: UserRole,
    entityManager?: EntityManager,
  ): Promise<OrgUserEntity> {
    const orgUsersRepository =
      entityManager?.getRepository(OrgUserEntity) || this.orgUsersRepository;

    return orgUsersRepository.save({
      userId,
      orgId,
      role,
    });
  }

  async getUsersInOrg(
    orgId: string,
    page: number,
    searchTerm?: string,
  ): Promise<{
    data: OrganizationUserWithUser[];
    total: number;
    nextPageCursor: string | null;
  }> {
    const pageSize = 50;
    const skip = page * pageSize;

    let whereClause:
      | FindOptionsWhere<OrgUserEntity>
      | FindOptionsWhere<OrgUserEntity>[];

    if (searchTerm) {
      whereClause = [
        {
          orgId,
          user: {
            email: ILike(`%${searchTerm}%`),
          },
        },
        {
          orgId,
          user: {
            firstName: ILike(`%${searchTerm}%`),
          },
        },
      ];
    } else {
      whereClause = {
        orgId,
      };
    }

    const [orgUsers, total] = await this.orgUsersRepository.findAndCount({
      where: whereClause,
      relations: {
        user: true,
      },
      order: {
        user: {
          email: 'ASC',
        },
      },
      take: pageSize,
      skip,
    });

    return {
      data: orgUsers as OrganizationUserWithUser[],
      total,
      nextPageCursor: total > skip + orgUsers.length ? String(page + 1) : null,
    };
  }

  async changeUserRole(
    requester: AuthedUser,
    orgId: string,
    userId: string,
    role: UserRole,
  ): Promise<void> {
    const orgUser = await this.orgUsersRepository.findOne({
      where: {
        orgId,
        userId,
      },
    });
    if (!orgUser) {
      throw new NotFoundException('User not found in org');
    }

    const requesterRole = requester.orgs.find((org) => org.id === orgId)?.role;
    if (!requesterRole) {
      throw new NotFoundException('Requester not found in org');
    }

    if (UserRoleOrder[requesterRole] > UserRoleOrder[orgUser.role]) {
      throw new BadRequestException(
        'Cannot change role of user with higher role',
      );
    }

    if (orgUser.role !== role) {
      orgUser.role = role;
      await this.orgUsersRepository.save(orgUser);
    }
  }

  async findOneById(orgId: string): Promise<OrganizationEntity | null> {
    return this.orgsRepository.findOne({
      where: {
        id: orgId,
      },
    });
  }

  async findOrgUsersByEmailIn(
    orgId: string,
    emails: string[],
  ): Promise<OrganizationUserWithUser[]> {
    return (await this.orgUsersRepository.find({
      where: {
        orgId,
        user: {
          email: In(emails),
        },
      },
      relations: {
        user: true,
      },
    })) as OrganizationUserWithUser[];
  }

  async isUserInOrg(userId: string, orgId: string): Promise<boolean> {
    const orgUser = await this.orgUsersRepository.findOne({
      where: {
        userId,
        orgId,
      },
    });

    return !!orgUser;
  }
}
