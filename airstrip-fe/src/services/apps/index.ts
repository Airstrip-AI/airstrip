import { NotFoundException } from '@/services/errors';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { getDb } from '@/utils/backend/drizzle';
import { apps } from '@/utils/backend/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function getAppById(appId: string) {
  const db = await getDb();

  const app = await db.query.apps.findFirst({
    where: eq(apps.id, appId),
    with: {
      org: true,
      team: true,
      aiProvider: true,
    },
    // relations: {
    //   org: true,
    //   orgTeam: true,
    //   aiProvider: true,
    // },
  });

  if (!app) {
    throw new NotFoundException('App not found');
  }

  return app;
}

export type AppEntity = Awaited<ReturnType<typeof getAppById>>;

export async function updateApp(appId: string, dto: UpdateAppReq) {
  const db = await getDb();

  return db.update(apps).set(dto).where(eq(apps.id, appId));
}

export async function deleteApp(appId: string) {
  const db = await getDb();

  return db.delete(apps).where(eq(apps.id, appId));
}
