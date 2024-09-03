'use server';

import { authGuard } from '@/actions/auth.guard';
import { makeAppsMemberGuard } from '@/actions/guards/apps.guard';
import * as appsService from '@/services/apps';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';

export async function getApp(appId: string): Promise<appsService.AppEntity> {
  await authGuard([makeAppsMemberGuard(appId)]);

  return appsService.getAppById(appId);
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
