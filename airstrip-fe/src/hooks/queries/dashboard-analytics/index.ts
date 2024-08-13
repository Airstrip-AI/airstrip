import { getValidToken, QueryKeys } from '@/hooks/helpers';
import { getAppsUsageData } from '@/utils/backend/client/dashboard-analytics';
import { AppsUsageDataResponse } from '@/utils/backend/client/dashboard-analytics/types';
import { useQuery } from 'react-query';

export function useGetAppsUsageData({
  orgId,
  onSuccess,
  onError,
}: {
  orgId: string;
  onSuccess?: (results: AppsUsageDataResponse) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.APPS_USAGE_DATA, orgId],
    queryFn: () => {
      if (!orgId) {
        return {
          data: [],
        };
      }
      const authToken = getValidToken();
      return getAppsUsageData({
        authToken,
        orgId,
      });
    },
    keepPreviousData: true,
    onSuccess,
    onError,
  });
}
