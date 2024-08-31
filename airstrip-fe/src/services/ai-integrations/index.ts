import { getOrgTeamById } from '@/actions/org-teams';
import { getDb } from '@/utils/backend/drizzle';
import { aiIntegrations } from '@/utils/backend/drizzle/schema';
import { and, eq, isNull, or } from 'drizzle-orm';
import { CreateAiIntegrationReq, UpdateAiIntegrationReq } from './types';

export async function createAiIntegration(req: CreateAiIntegrationReq) {
  const db = await getDb();
  const duplicateApiKey = await db.query.aiIntegrations.findFirst({
    where: eq(aiIntegrations.aiProviderApiKey, req.aiProviderApiKey),
  });

  if (duplicateApiKey) {
    throw new Error('This API key is already in use.');
  }

  let orgTeam = null;

  if (req.restrictedToTeamId) {
    orgTeam = await getOrgTeamById(req.restrictedToTeamId);

    if (orgTeam.orgId !== req.orgId) {
      throw new Error('Team does not belong to the organization.');
    }
  }

  const update = await db
    .insert(aiIntegrations)
    .values({
      orgId: req.orgId,
      restrictedToTeamId: orgTeam?.id ?? null,
      name: req.name,
      description: req.description,
      aiProvider: req.aiProvider,
      aiProviderApiKey: req.aiProviderApiKey,
      aiProviderApiUrl: req.aiProviderApiUrl,
      aiModel: req.aiModel,
    })
    .returning();

  const aiIntegration = update[0];

  return {
    ...aiIntegration,
    restrictedToTeam: orgTeam,
  };
}

export async function updateAiIntegration(req: UpdateAiIntegrationReq) {
  const db = await getDb();
  const aiIntegration = await getAiIntegration(req.aiIntegrationId);

  if (!aiIntegration) {
    throw new Error('AI integration not found.');
  }

  let orgTeam = null;

  if (req.restrictedToTeamId) {
    orgTeam = await getOrgTeamById(req.restrictedToTeamId);

    if (orgTeam.orgId !== aiIntegration.orgId) {
      throw new Error('Different orgs for AI integration and team.');
    }
  }

  const updatedAiIntegration = await db
    .update(aiIntegrations)
    .set({
      ...aiIntegration,
      restrictedToTeamId: req.restrictedToTeamId,
      name: req.name,
      description: req.description,
      aiProvider: req.aiProvider,
      aiProviderApiKey: req.aiProviderApiKey,
      aiProviderApiUrl: req.aiProviderApiUrl,
      aiModel: req.aiModel,
    })
    .returning();

  return {
    ...updatedAiIntegration[0],
    restrictedToTeam: orgTeam,
  };
}

export async function deleteAiIntegration(
  aiIntegrationId: string,
): Promise<void> {
  const db = await getDb();

  if (!aiIntegrationId) {
    return;
  }

  await db.delete(aiIntegrations).where(eq(aiIntegrations.id, aiIntegrationId));
}

export async function getAiIntegration(aiIntegrationId: string) {
  const db = await getDb();

  const aiIntegration = await db.query.aiIntegrations.findFirst({
    where: eq(aiIntegrations.id, aiIntegrationId),
    with: {
      restrictedToTeam: true,
    },
  });

  if (!aiIntegration) {
    throw new Error('AI integration not found.');
  }

  return aiIntegration;
}

export async function listAiIntegrationsInOrg(orgId: string, page: number) {
  const db = await getDb();
  const pageSize = 50;

  const aiIntegrationsPage = await db.query.aiIntegrations.findMany({
    where: eq(aiIntegrations.orgId, orgId),
    with: {
      restrictedToTeam: true,
    },
    limit: pageSize + 1,
    offset: page * pageSize,
  });

  return {
    data: aiIntegrationsPage.slice(0, pageSize),
    nextPageCursor:
      aiIntegrationsPage.length > pageSize ? String(page + 1) : null,
  };
}

export async function getAllOrgWideAiIntegrations(orgId: string) {
  const db = await getDb();

  const data = await db.query.aiIntegrations.findMany({
    where: and(
      eq(aiIntegrations.orgId, orgId),
      isNull(aiIntegrations.restrictedToTeamId),
    ),
    with: {
      restrictedToTeam: true,
    },
  });

  return {
    data,
  };
}

export async function getAllAiIntegrationsAccessibleByTeam(orgTeamId: string) {
  const db = await getDb();

  const orgTeam = await getOrgTeamById(orgTeamId);
  const data = await db.query.aiIntegrations.findMany({
    where: or(
      and(
        eq(aiIntegrations.orgId, orgTeam.orgId),
        isNull(aiIntegrations.restrictedToTeamId),
      ),
      eq(aiIntegrations.restrictedToTeamId, orgTeamId),
    ),
    with: {
      restrictedToTeam: true,
    },
  });

  return {
    data,
  };
}
