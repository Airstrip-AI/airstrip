import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { OrgTeamEntity } from './org-team.entity';
import { OrgTeamUserEntity } from './org-team-user.entity';
import {
  CreateOrgTeamReq,
  OrgTeamEntityWithAuthedUserRoleAndNumMembers,
  OrgTeamUserWithOrgTeamJoined,
  OrgTeamUserWithUserJoined,
} from './types/service';
import { UserRole, UserRoleOrder } from '../../utils/constants';
import { OrgsService } from '../orgs/orgs.service';
import { AuthedUser } from '../auth/types/service';
import { OrganizationUserWithUser } from '../orgs/types/service';

@Injectable()
export class OrgTeamsService {
  constructor(
    @InjectRepository(OrgTeamEntity)
    private readonly orgTeamRepository: Repository<OrgTeamEntity>,
    @InjectRepository(OrgTeamUserEntity)
    private readonly orgTeamUserRepository: Repository<OrgTeamUserEntity>,
    private readonly orgsService: OrgsService,
  ) {}

  async createOrgTeamAndAddUserAsOwner(
    createOrgTeamReq: CreateOrgTeamReq,
    entityManager?: EntityManager,
  ): Promise<OrgTeamEntityWithAuthedUserRoleAndNumMembers> {
    const orgTeamRepo =
      entityManager?.getRepository(OrgTeamEntity) || this.orgTeamRepository;

    const orgTeamEntity = await orgTeamRepo.save({
      orgId: createOrgTeamReq.orgId,
      name: createOrgTeamReq.name,
    });

    await this.addUsersToOrgTeam(
      orgTeamEntity,
      [createOrgTeamReq.creatorId],
      UserRole.OWNER,
      entityManager,
    );

    return {
      ...orgTeamEntity,
      authedUserRole: UserRole.OWNER,
      numMembers: 1,
    };
  }

  async addUsersToOrgTeamByOrgTeamId(
    orgTeamId: string,
    userIds: string[],
    role: UserRole,
  ): Promise<OrgTeamUserEntity[]> {
    if (!userIds.length) {
      return [];
    }

    const team = await this.orgTeamRepository.findOne({
      where: {
        id: orgTeamId,
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${orgTeamId} not found.`);
    }

    // filter out those that are already in the team
    const existingOrgTeamUsersMap = (
      await this.orgTeamUserRepository.find({
        where: {
          orgTeamId: team.id,
          userId: In(userIds),
        },
      })
    ).reduce((acc, user) => {
      acc.add(user.userId);
      return acc;
    }, new Set<string>());

    const filteredUserIds = userIds.filter(
      (userId) => !existingOrgTeamUsersMap.has(userId),
    );

    return this.addUsersToOrgTeam(team, filteredUserIds, role);
  }

  async getOrgTeams(
    authedUser: AuthedUser,
    orgId: string,
    page: number,
  ): Promise<{
    data: OrgTeamEntityWithAuthedUserRoleAndNumMembers[];
    nextPageCursor: string | null;
  }> {
    const pageSize = 50;

    const orgTeams = await this.orgTeamRepository.find({
      where: {
        orgId,
      },
      order: {
        createdAt: 'DESC',
        name: 'ASC',
      },
      take: pageSize + 1,
      skip: page * pageSize,
    });

    const { authedUserOrgTeamRolesMap, orgTeamUsersCountMap } = orgTeams.length
      ? await this.getOrgTeamsUserRolesAndMemberCounts(
          authedUser,
          orgTeams.map((team) => team.id),
        )
      : {
          authedUserOrgTeamRolesMap: new Map<string, UserRole>(),
          orgTeamUsersCountMap: new Map<string, number>(),
        };

    const data: OrgTeamEntityWithAuthedUserRoleAndNumMembers[] = orgTeams
      .slice(0, pageSize)
      .map((team) => ({
        ...team,
        authedUserRole: authedUserOrgTeamRolesMap.get(team.id) || null,
        numMembers: orgTeamUsersCountMap.get(team.id) || 0,
      }));

    return {
      data,
      nextPageCursor: orgTeams.length > pageSize ? String(page + 1) : null,
    };
  }

  async getOrgTeamById(orgTeamId: string): Promise<OrgTeamEntity> {
    const orgTeam = await this.orgTeamRepository.findOne({
      where: {
        id: orgTeamId,
      },
    });

    if (!orgTeam) {
      throw new NotFoundException('Team not found.');
    }

    return orgTeam;
  }

  async getOrgTeamWithRoleAndNumMembersById(
    authedUser: AuthedUser,
    orgTeamId: string,
  ): Promise<OrgTeamEntityWithAuthedUserRoleAndNumMembers> {
    const orgTeam = await this.getOrgTeamById(orgTeamId);

    const { authedUserOrgTeamRolesMap, orgTeamUsersCountMap } =
      await this.getOrgTeamsUserRolesAndMemberCounts(authedUser, [orgTeam.id]);

    return {
      ...orgTeam,
      authedUserRole: authedUserOrgTeamRolesMap.get(orgTeam.id) || null,
      numMembers: orgTeamUsersCountMap.get(orgTeam.id) || 0,
    };
  }

  async getOrgUsersAndTeamMembershipDetails(
    orgTeamId: string,
    page: number,
    searchTerm?: string,
  ): Promise<{
    data: (OrganizationUserWithUser & {
      teamRole: UserRole | null;
    })[];
    nextPageCursor: string | null;
  }> {
    const team = await this.getOrgTeamById(orgTeamId);
    const orgUsersPage = await this.orgsService.getUsersInOrg(
      team.orgId,
      page,
      searchTerm,
    );
    const userIds = orgUsersPage.data.map((orgUser) => orgUser.userId);
    const orgTeamUsersMap = userIds.length
      ? (
          await this.orgTeamUserRepository.find({
            where: {
              orgTeamId: team.id,
              userId: In(userIds),
            },
          })
        ).reduce((acc, orgTeamUser) => {
          acc.set(orgTeamUser.userId, orgTeamUser.role);
          return acc;
        }, new Map<string, UserRole>())
      : new Map<string, UserRole>();

    return {
      data: orgUsersPage.data.map((orgUser) => ({
        ...orgUser,
        teamRole: orgTeamUsersMap.get(orgUser.userId) || null,
      })),
      nextPageCursor: orgUsersPage.nextPageCursor,
    };
  }

  async getOrgTeamUsers(
    orgTeamId: string,
    page: number,
  ): Promise<{
    data: OrgTeamUserWithUserJoined[];
    nextPageCursor: string | null;
  }> {
    const pageSize = 50;

    const orgTeamUsers = (await this.orgTeamUserRepository.find({
      where: {
        orgTeamId,
      },
      order: {
        user: {
          email: 'ASC',
        },
      },
      take: pageSize + 1,
      skip: page * pageSize,
      relations: {
        user: true,
      },
    })) as OrgTeamUserWithUserJoined[];

    return {
      data: orgTeamUsers.slice(0, pageSize),
      nextPageCursor: orgTeamUsers.length > pageSize ? String(page + 1) : null,
    };
  }

  async getOrgTeamUser(
    orgTeamId: string,
    userId: string,
  ): Promise<OrgTeamUserEntity | null> {
    return await this.orgTeamUserRepository.findOne({
      where: {
        orgTeamId,
        userId,
      },
    });
  }

  async getUserOrgTeams(
    orgId: string,
    userId: string,
  ): Promise<OrgTeamUserWithOrgTeamJoined[]> {
    return (await this.orgTeamUserRepository.find({
      where: {
        userId,
        orgId,
      },
      relations: {
        orgTeam: true,
      },
    })) as OrgTeamUserWithOrgTeamJoined[];
  }

  async changeOrgTeamUserRole(
    authedUser: AuthedUser,
    orgTeamId: string,
    userId: string,
    role: UserRole,
  ): Promise<void> {
    const orgTeamUserToUpdate = await this.getOrgTeamUser(orgTeamId, userId);
    if (!orgTeamUserToUpdate) {
      throw new NotFoundException('User not found in team.');
    }

    const requesterOrgRole = authedUser.orgs.find(
      (org) => org.id === orgTeamUserToUpdate.orgId,
    )?.role;
    if (!requesterOrgRole) {
      throw new UnauthorizedException('Unauthorized: you are not in org.');
    }

    // check org-level role first
    const isOrgAdmin =
      UserRoleOrder[requesterOrgRole] <= UserRoleOrder[UserRole.ADMIN];
    let isAuthorizedToMakeChange = isOrgAdmin;

    if (!isAuthorizedToMakeChange) {
      // check team-level role
      const requesterOrgTeamUser = await this.getOrgTeamUser(
        orgTeamId,
        authedUser.id,
      );
      if (requesterOrgTeamUser) {
        const isTeamAdminAndNotLowerThanUser =
          UserRoleOrder[requesterOrgTeamUser.role] <=
            UserRoleOrder[UserRole.ADMIN] &&
          UserRoleOrder[requesterOrgTeamUser.role] <=
            UserRoleOrder[orgTeamUserToUpdate.role];

        isAuthorizedToMakeChange = isTeamAdminAndNotLowerThanUser;
      }
    }

    if (!isAuthorizedToMakeChange) {
      throw new UnauthorizedException('Unauthorized: insufficient role.');
    }

    if (orgTeamUserToUpdate.role !== role) {
      orgTeamUserToUpdate.role = role;
      await this.orgTeamUserRepository.save(orgTeamUserToUpdate);
    }
  }

  private async addUsersToOrgTeam(
    orgTeam: OrgTeamEntity,
    userIds: string[],
    role: UserRole,
    entityManager?: EntityManager,
  ): Promise<OrgTeamUserEntity[]> {
    // check if all users are in org. I don't expect a lot of users to be added at once, so making individual database calls
    // here should be fine.
    const areAllUsersInOrg = await Promise.all(
      userIds.map(
        async (userId) =>
          await this.orgsService.isUserInOrg(userId, orgTeam.orgId),
      ),
    );
    if (!areAllUsersInOrg.every((isInOrg) => isInOrg)) {
      throw new BadRequestException('Some users are not in org.');
    }
    const orgTeamUserRepo =
      entityManager?.getRepository(OrgTeamUserEntity) ||
      this.orgTeamUserRepository;

    const now = new Date();
    return await orgTeamUserRepo.save(
      userIds.map((userId) => ({
        orgTeamId: orgTeam.id,
        userId,
        orgId: orgTeam.orgId,
        role,
        joinedTeamAt: now,
      })),
    );
  }

  private async getOrgTeamsUserRolesAndMemberCounts(
    authedUser: AuthedUser,
    orgTeamIds: string[],
  ): Promise<{
    authedUserOrgTeamRolesMap: Map<string, UserRole>;
    orgTeamUsersCountMap: Map<string, number>;
  }> {
    const authedUserOrgTeamUser = orgTeamIds.length
      ? await this.orgTeamUserRepository.find({
          where: {
            userId: authedUser.id,
            orgTeamId: In(orgTeamIds),
          },
        })
      : [];

    const authedUserOrgTeamRolesMap = authedUserOrgTeamUser.reduce(
      (acc, teamUser) => {
        acc.set(teamUser.orgTeamId, teamUser.role);
        return acc;
      },
      new Map<string, UserRole>(),
    );

    const orgTeamUsersCount: {
      org_team_id: string;
      count: string;
    }[] = orgTeamIds.length
      ? await this.orgTeamUserRepository.query(
          `SELECT org_team_id, count(*) FROM org_team_users WHERE org_team_id = ANY($1) GROUP BY org_team_id`,
          [orgTeamIds],
        )
      : [];
    const orgTeamUsersCountMap = orgTeamUsersCount.reduce((acc, count) => {
      acc.set(count.org_team_id, Number(count.count));
      return acc;
    }, new Map<string, number>());

    return {
      authedUserOrgTeamRolesMap,
      orgTeamUsersCountMap,
    };
  }
}
