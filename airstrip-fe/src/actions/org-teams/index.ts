import { getDb } from '@/utils/backend/drizzle';
import { orgTeams } from '@/utils/backend/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function getOrgTeamById(orgTeamId: string) {
  const db = await getDb();

  const orgTeam = await db.query.orgTeams.findFirst({
    where: eq(orgTeams.id, orgTeamId),
  });

  if (!orgTeam) {
    throw new Error('Team not found.');
  }

  return orgTeam;
}
