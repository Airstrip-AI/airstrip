import { UserRoleOrder } from '@/actions/guards/guard.utils';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { UserRole } from '@/utils/backend/client/common/types';
import { getDb } from '@/utils/backend/drizzle';
import { organizations, orgUsers, users } from '@/utils/backend/drizzle/schema';
import { and, count, eq, ilike, inArray, or } from 'drizzle-orm';

export async function createOrgAndAddUserAsOwner(
  name: string,
  creatorId: string,
) {
  const db = await getDb();

  const newOrg = (
    await db.insert(organizations).values({ name }).returning()
  )[0];

  await addUserToOrg(newOrg.id, creatorId, UserRole.OWNER);

  return newOrg;
}

async function addUserToOrg(orgId: string, userId: string, role: UserRole) {
  const db = await getDb();

  return (
    await db
      .insert(orgUsers)
      .values({
        orgId,
        userId,
        role,
      })
      .returning()
  )[0];
}

export async function getUsersInOrg(
  orgId: string,
  pagination: {
    page: number;
    /**
     * If true, fetch all users in the org. `page` will be ignored.
     */
    fetchAll: boolean;
  },
  searchTerm?: string,
) {
  const pageSize = 50;
  const skip = pagination.fetchAll ? 0 : pagination.page * pageSize;

  const db = await getDb();

  const orgIdEq = eq(organizations.id, orgId);
  const where = searchTerm
    ? or(
        and(orgIdEq, ilike(users.email, `%${searchTerm}%`)),
        and(orgIdEq, ilike(users.firstName, `%${searchTerm}%`)),
      )
    : orgIdEq;

  const orgUsersData = await db.query.orgUsers.findMany({
    where,
    with: {
      users: true,
    },
    orderBy(fields, { asc }) {
      return [asc(fields.joinedOrgAt)]; // originally was supposed to sort by user email, but haven't figured out how to do that
    },
    // order: {
    //   user: {
    //     email: 'ASC',
    //   },
    // },
    ...(pagination.fetchAll
      ? {}
      : {
          limit: pageSize,
          offset: skip,
        }),
  });
  const total = (
    await db.select({ count: count() }).from(orgUsers).where(where)
  )[0].count;

  return {
    data: orgUsersData,
    total,
    nextPageCursor: pagination.fetchAll
      ? null
      : total > skip + orgUsersData.length
        ? String(pagination.page + 1)
        : null,
  };
}

export async function changeUserRole(
  requester: UserProfileResp,
  orgId: string,
  userId: string,
  role: UserRole,
): Promise<void> {
  const db = await getDb();

  const orgUser = await db.query.orgUsers.findFirst({
    where: and(eq(orgUsers.orgId, orgId), eq(orgUsers.userId, userId)),
  });

  if (!orgUser) {
    throw new Error('User not found in org');
  }

  const requesterRole = requester.orgs.find((org) => org.id === orgId)?.role;
  if (!requesterRole) {
    throw new Error('Requester not found in org');
  }

  if (UserRoleOrder[requesterRole] > UserRoleOrder[orgUser.role]) {
    throw new Error('Cannot change role of user with higher role');
  }

  if (orgUser.role !== role) {
    await db
      .update(orgUsers)
      .set({ role })
      .where(
        and(
          eq(orgUsers.userId, orgUser.userId),
          eq(orgUsers.orgId, orgUser.orgId),
        ),
      );
    // await this.orgUsersRepository.save(orgUser);
  }
}

export async function findOneById(orgId: string) {
  const db = await getDb();

  return db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });
}

export async function findOrgUsersByEmailIn(orgId: string, emails: string[]) {
  const db = await getDb();

  const userIds = (
    await db.query.users.findMany({
      where: (users, { inArray }) => {
        return inArray(users.email, emails);
      },
      columns: {
        id: true,
      },
    })
  ).map((user) => user.id);

  const orgUsers = db.query.orgUsers.findMany({
    with: {
      users: true,
    },
    where: (orgUsers, { eq }) => {
      return and(eq(orgUsers.orgId, orgId), inArray(orgUsers.userId, userIds));
    },
  });

  return orgUsers;
  // return (await this.orgUsersRepository.find({
  //   where: {
  //     orgId,
  //     user: {
  //       email: In(emails),
  //     },
  //   },
  //   relations: {
  //     users: true,
  //   },
  // })) as OrganizationUserWithUser[];
}

export async function isUserInOrg(
  userId: string,
  orgId: string,
): Promise<boolean> {
  const db = await getDb();

  const orgUser = await db.query.orgUsers.findFirst({
    where: and(eq(orgUsers.userId, userId), eq(orgUsers.orgId, orgId)),
  });

  return !!orgUser;
}
