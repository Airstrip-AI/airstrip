'use server';

import * as kbServices from '@/services/knowledge-base';
import { authGuard } from '../auth.guard';
import { makeAppsMemberGuard } from '../guards/apps.guard';
import { makeOrgsMemberGuard } from '../guards/orgs.guard';

export async function getDocUploadPresignedUrl(dto: {
  filename: string;
  contentType: string;
  size: number;
}) {
  await authGuard([]);

  return kbServices.getDocUploadPresignedUrl(dto);
}

export async function createKbSource(dto: {
  orgId: string;
  name: string;
  blobKey: string;
  contentType: string;
  size: number;
}) {
  const { authToken } = await authGuard([]);

  return kbServices.createKbSource(authToken, dto);
}

export async function listKbSources(orgId: string) {
  await authGuard([makeOrgsMemberGuard(orgId)]);

  return kbServices.listKbSources(orgId);
}

export async function listAppKbSources(appId: string) {
  await authGuard([makeAppsMemberGuard(appId)]);

  return kbServices.listAppKbSources(appId);
}

export async function saveAppKbSources(dto: {
  appId: string;
  sourceIds: string[];
}) {
  await authGuard([makeAppsMemberGuard(dto.appId)]);

  return kbServices.saveAppKbSources(dto);
}
