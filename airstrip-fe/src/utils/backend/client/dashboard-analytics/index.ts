import { AppsUsageDataResponse } from '@/utils/backend/client/dashboard-analytics/types';
import { makeGetRequest } from '@/utils/backend/utils';

export async function getAppsUsageData({
  orgId,
  authToken,
}: {
  orgId: string;
  authToken: string;
}) {
  return await makeGetRequest<AppsUsageDataResponse>({
    endpoint: `/api/v1/orgs/${orgId}/dashboard-analytics/apps-usage`,
    authToken,
  });
}
