import { isAdminOrAbove, UserRoleOrder } from '@/actions/guards/guard.utils';
import * as orgsService from '@/services/orgs';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { UserRole } from '@/utils/backend/client/common/types';
import { getDb } from '@/utils/backend/drizzle';
import { orgTeams, orgTeamUsers } from '@/utils/backend/drizzle/schema';
import { and, count, eq, inArray } from 'drizzle-orm';
import { CreateOrgTeamReq, OrgTeamEntity } from './types';

export async function createOrgTeamAndAddUserAsOwner(
  user: UserProfileResp,
  createOrgTeamReq: CreateOrgTeamReq,
) {
  const db = await getDb();

  const orgTeamEntity = (
    await db
      .insert(orgTeams)
      .values({
        orgId: createOrgTeamReq.orgId,
        name: createOrgTeamReq.name,
      })
      .returning()
  )[0];

  await addUsersToOrgTeam(orgTeamEntity, [user.id], UserRole.OWNER);

  return {
    ...orgTeamEntity,
    authedUserRole: UserRole.OWNER,
    numMembers: 1,
  };
}

export async function addUsersToOrgTeamByOrgTeamId(
  orgTeamId: string,
  userIds: string[],
  role: UserRole,
) {
  if (!userIds.length) {
    return [];
  }

  const team = await getOrgTeamById(orgTeamId);

  if (!team) {
    throw new Error(`Team with id ${orgTeamId} not found.`);
  }

  const db = await getDb();

  // filter out those that are already in the team
  const existingOrgTeamUsersSet = (
    await db.query.orgTeamUsers.findMany({
      where: and(
        eq(orgTeamUsers.orgTeamId, team.id),
        inArray(orgTeamUsers.userId, userIds),
      ),
    })
  ).reduce((userSet, user) => {
    userSet.add(user.userId);
    return userSet;
  }, new Set<string>());

  const filteredUserIds = userIds.filter(
    (userId) => !existingOrgTeamUsersSet.has(userId),
  );

  return addUsersToOrgTeam(team, filteredUserIds, role);
}

export async function getOrgTeams(
  authedUser: UserProfileResp,
  orgId: string,
  pagination: {
    /**
     * If `fetchAll` is true, `page` is ignored.
     */
    page: number;
    fetchAll: boolean;
  },
) {
  // : Promise<{
  //   data: OrgTeamEntityWithAuthedUserRoleAndNumMembers[];
  //   nextPageCursor: string | null;
  // }>
  const db = await getDb();

  const pageSize = 50;

  const orgTeamsData = await db.query.orgTeams.findMany({
    where: eq(orgTeams.orgId, orgId),
    orderBy: (fields, { asc, desc }) => {
      return [desc(fields.createdAt), asc(fields.name)];
    },
    ...(pagination.fetchAll
      ? {}
      : {
          limit: pageSize + 1,
          offset: pageSize * pagination.page,
        }),
  });

  const { authedUserOrgTeamRolesMap, orgTeamUsersCountMap } =
    orgTeamsData.length
      ? await getOrgTeamsUserRolesAndMemberCounts(
          authedUser,
          orgTeamsData.map((team) => team.id),
        )
      : {
          authedUserOrgTeamRolesMap: new Map<string, UserRole>(),
          orgTeamUsersCountMap: new Map<string, number>(),
        };

  const data = (
    pagination.fetchAll ? orgTeamsData : orgTeamsData.slice(0, pageSize)
  ).map((team) => ({
    ...team,
    authedUserRole: authedUserOrgTeamRolesMap.get(team.id) || null,
    numMembers: orgTeamUsersCountMap.get(team.id) || 0,
  }));

  return {
    data,
    nextPageCursor: pagination.fetchAll
      ? null
      : orgTeamsData.length > pageSize
        ? String(pagination.page + 1)
        : null,
  };
}

export async function getOrgTeamById(
  orgTeamId: string,
): Promise<OrgTeamEntity> {
  const db = await getDb();

  const orgTeam = await db.query.orgTeams.findFirst({
    where: eq(orgTeams.id, orgTeamId),
  });

  if (!orgTeam) {
    throw new Error('Team not found.');
  }

  return orgTeam;
}

async function getOrgTeamWithRoleAndNumMembersById(
  authedUser: UserProfileResp,
  orgTeamId: string,
) {
  // : Promise<OrgTeamEntityWithAuthedUserRoleAndNumMembers> {
  const orgTeam = await getOrgTeamById(orgTeamId);

  const { authedUserOrgTeamRolesMap, orgTeamUsersCountMap } =
    await getOrgTeamsUserRolesAndMemberCounts(authedUser, [orgTeam.id]);

  return {
    ...orgTeam,
    authedUserRole: authedUserOrgTeamRolesMap.get(orgTeam.id) || null,
    numMembers: orgTeamUsersCountMap.get(orgTeam.id) || 0,
  };
}

async function getOrgUsersAndTeamMembershipDetails(
  orgTeamId: string,
  pagination: {
    page: number;
    /**
     * If `fetchAll` is true, `page` is ignored.
     */
    fetchAll: boolean;
  },
  searchTerm?: string,
) {
  // : Promise<{
  //   data: (OrganizationUserWithUser & {
  //     teamRole: UserRole | null;
  //   })[];
  //   nextPageCursor: string | null;
  // }> {
  const db = await getDb();

  const team = await getOrgTeamById(orgTeamId);

  const orgUsersPage = await orgsService.getUsersInOrg(
    team.orgId,
    pagination,
    searchTerm,
  );
  const userIds = orgUsersPage.data.map((orgUser) => orgUser.userId);
  const orgTeamUsersMap = userIds.length
    ? (
        await db.query.orgTeamUsers.findMany({
          where: and(
            eq(orgTeamUsers.orgTeamId, team.id),
            inArray(orgTeamUsers.userId, userIds),
          ),
        })
      )
        // await this.orgTeamUserRepository.find({
        //   where: {
        //     orgTeamId: team.id,
        //     userId: In(userIds),
        //   },
        // })
        .reduce((acc, orgTeamUser) => {
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

export async function getOrgTeamUsers(orgTeamId: string, page: number) {
  // : Promise<{
  //   data: OrgTeamUserWithUserJoined[];
  //   nextPageCursor: string | null;
  // }> {
  const db = await getDb();

  const pageSize = 50;

  const orgTeamUsersData = await db.query.orgTeamUsers.findMany({
    where: eq(orgTeamUsers.orgTeamId, orgTeamId),
    with: {
      user: true,
    },
    orderBy(fields, { asc }) {
      return [asc(fields.joinedTeamAt)]; // by right should be user.email
    },
    limit: pageSize + 1,
    offset: page * pageSize,
  });
  // const orgTeamUsersData = (await this.orgTeamUserRepository.find({
  //   where: {
  //     orgTeamId,
  //   },
  //   order: {
  //     user: {
  //       email: 'ASC',
  //     },
  //   },
  //   take: pageSize + 1,
  //   skip: page * pageSize,
  //   relations: {
  //     user: true,
  //   },
  // })) as OrgTeamUserWithUserJoined[];

  return {
    data: orgTeamUsersData.slice(0, pageSize),
    nextPageCursor:
      orgTeamUsersData.length > pageSize ? String(page + 1) : null,
  };
}

export async function getOrgTeamUser(orgTeamId: string, userId: string) {
  const db = await getDb();
  const data = await db.query.orgTeamUsers.findFirst({
    where: and(
      eq(orgTeamUsers.orgTeamId, orgTeamId),
      eq(orgTeamUsers.userId, userId),
    ),
  });

  return data;
}

export async function getUserOrgTeams(orgId: string, userId: string) {
  const db = await getDb();

  const data = await db.query.orgTeamUsers.findMany({
    where: and(eq(orgTeamUsers.userId, userId), eq(orgTeamUsers.orgId, orgId)),
    with: {
      orgTeam: true,
    },
  });

  return data;
}

export async function changeOrgTeamUserRole(
  authedUser: UserProfileResp,
  orgTeamId: string,
  userId: string,
  role: UserRole,
): Promise<void> {
  const db = await getDb();

  const orgTeamUserToUpdate = await getOrgTeamUser(orgTeamId, userId);
  if (!orgTeamUserToUpdate) {
    throw new Error('User not found in team.');
  }

  const requesterOrgRole = authedUser.orgs.find(
    (org) => org.id === orgTeamUserToUpdate.orgId,
  )?.role;
  if (!requesterOrgRole) {
    throw new Error('Unauthorized: you are not in org.');
  }

  // check org-level role first
  const isOrgAdmin = isAdminOrAbove(requesterOrgRole);
  let isAuthorizedToMakeChange = isOrgAdmin;

  if (!isAuthorizedToMakeChange) {
    // check team-level role
    const requesterOrgTeamUser = await getOrgTeamUser(orgTeamId, authedUser.id);

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
    throw new Error('Unauthorized: insufficient role.');
  }

  if (orgTeamUserToUpdate.role !== role) {
    orgTeamUserToUpdate.role = role;
    await db
      .update(orgTeamUsers)
      .set({ role })
      .where(
        and(
          eq(orgTeamUsers.userId, orgTeamUserToUpdate.userId),
          eq(orgTeamUsers.orgTeamId, orgTeamUserToUpdate.orgTeamId),
        ),
      );
  }
}

async function addUsersToOrgTeam( // private
  orgTeam: OrgTeamEntity,
  userIds: string[],
  role: UserRole,
) {
  const db = await getDb();

  // check if all users are in org. I don't expect a lot of users to be added at once, so making individual database calls
  // here should be fine.
  const areAllUsersInOrg = await Promise.all(
    userIds.map(
      async (userId) => await orgsService.isUserInOrg(userId, orgTeam.orgId),
    ),
  );
  if (!areAllUsersInOrg.every((isInOrg) => isInOrg)) {
    throw new Error('Some users are not in org.');
  }

  const now = new Date();
  const values = userIds.map((userId) => ({
    orgTeamId: orgTeam.id,
    userId,
    orgId: orgTeam.orgId,
    role,
    joinedTeamAt: now,
  }));

  return db.insert(orgTeamUsers).values(values).returning();
}

async function getOrgTeamsUserRolesAndMemberCounts( // private
  authedUser: UserProfileResp,
  orgTeamIds: string[],
): Promise<{
  authedUserOrgTeamRolesMap: Map<string, UserRole>;
  orgTeamUsersCountMap: Map<string, number>;
}> {
  const db = await getDb();

  const authedUserOrgTeamUser = orgTeamIds.length
    ? await db.query.orgTeamUsers.findMany({
        where: and(
          eq(orgTeamUsers.userId, authedUser.id),
          inArray(orgTeamUsers.orgTeamId, orgTeamIds),
        ),
      })
    : // ? await this.orgTeamUserRepository.find({
      //     where: {
      //       userId: authedUser.id,
      //       orgTeamId: In(orgTeamIds),
      //     },
      //   })
      [];

  const authedUserOrgTeamRolesMap = authedUserOrgTeamUser.reduce(
    (acc, teamUser) => {
      acc.set(teamUser.orgTeamId, teamUser.role);
      return acc;
    },
    new Map<string, UserRole>(),
  );

  const orgTeamUsersCount: {
    org_team_id: string;
    count: number;
  }[] = orgTeamIds.length
    ? await db
        .select({
          org_team_id: orgTeamUsers.orgTeamId,
          count: count(),
        })
        .from(orgTeamUsers)
        .where(inArray(orgTeamUsers.orgTeamId, orgTeamIds))
        .groupBy(orgTeamUsers.orgTeamId)
    : // ? await db.execute(sql`SELECT org_team_id, count(*) FROM org_team_users WHERE org_team_id = ANY(${orgTeamIds}) GROUP BY org_team_id`)
      // ? await this.orgTeamUserRepository.query(
      //     `SELECT org_team_id, count(*) FROM org_team_users WHERE org_team_id = ANY($1) GROUP BY org_team_id`,
      //     [orgTeamIds],
      //   )
      [];
  const orgTeamUsersCountMap = orgTeamUsersCount.reduce((acc, count) => {
    acc.set(count.org_team_id, Number(count.count));
    return acc;
  }, new Map<string, number>());

  return {
    authedUserOrgTeamRolesMap,
    orgTeamUsersCountMap,
  };
}
