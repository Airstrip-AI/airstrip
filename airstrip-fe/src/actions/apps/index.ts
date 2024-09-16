'use server';

import { authGuard } from '@/actions/auth.guard';
import {
  makeAppsAdminCreationGuard,
  makeAppsMemberGuard,
} from '@/actions/guards/apps.guard';
import * as appsService from '@/services/apps';
import { CreateAppReq } from '@/services/apps/types';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';

export async function getApp(appId: string): Promise<appsService.AppEntity> {
  await authGuard([makeAppsMemberGuard(appId)]);

  return appsService.getAppById(appId);
}

export async function createApp({
  orgId,
  dto,
}: {
  orgId: string;
  dto: CreateAppReq;
}): Promise<appsService.AppEntity> {
  await authGuard([makeAppsAdminCreationGuard(orgId, dto.teamId)]);

  return appsService.createApp(orgId, dto);
}

export async function updateApp({
  appId,
  body,
}: {
  appId: string;
  body: UpdateAppReq;
}): Promise<appsService.AppEntity> {
  await authGuard([makeAppsMemberGuard(appId)]);

  await appsService.updateApp(appId, body);

  return appsService.getAppById(appId);
}

export async function deleteApp(appId: string): Promise<void> {
  await authGuard([makeAppsMemberGuard(appId)]);

  await appsService.deleteApp(appId);

  return;
}
