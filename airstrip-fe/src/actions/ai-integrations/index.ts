'use server';

import { makeAiIntegrationsAdminGuard } from '@/actions/guards/ai-integrations.guard';
import * as aiIntegrationsService from '@/services/ai-integrations';
import {
  CreateAiIntegrationReq,
  UpdateAiIntegrationReq,
} from '@/services/ai-integrations/types';
import { authGuard } from '../auth.guard';
import { makeOrgTeamsAdminGuard } from '../guards/org-teams.guard';
import { makeOrgsAdminGuard } from '../guards/orgs.guard';

export async function createAiIntegration(req: CreateAiIntegrationReq) {
  await authGuard([makeOrgsAdminGuard(req.orgId)]);

  return aiIntegrationsService.createAiIntegration(req);
}

export async function updateAiIntegration(req: UpdateAiIntegrationReq) {
  await authGuard([makeAiIntegrationsAdminGuard(req.aiIntegrationId)]);

  return aiIntegrationsService.updateAiIntegration(req);
}

export async function deleteAiIntegration(
  aiIntegrationId: string,
): Promise<void> {
  await authGuard([makeAiIntegrationsAdminGuard(aiIntegrationId)]);

  return aiIntegrationsService.deleteAiIntegration(aiIntegrationId);
}

export async function getAiIntegration(aiIntegrationId: string) {
  await authGuard([makeAiIntegrationsAdminGuard(aiIntegrationId)]);

  return aiIntegrationsService.getAiIntegration(aiIntegrationId);
}

export async function listAiIntegrationsInOrg(orgId: string, page: number) {
  await authGuard([makeOrgsAdminGuard(orgId)]);

  return aiIntegrationsService.listAiIntegrationsInOrg(orgId, page);
}

export async function getAllAiIntegrationsAccessibleByTeam(orgTeamId: string) {
  await authGuard([makeOrgTeamsAdminGuard(orgTeamId)]);

  return aiIntegrationsService.getAllAiIntegrationsAccessibleByTeam(orgTeamId);
}
