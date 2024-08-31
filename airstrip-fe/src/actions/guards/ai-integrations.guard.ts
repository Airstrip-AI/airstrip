import * as aiIntegrationsService from '@/services/ai-integrations';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { validate as uuidValidate } from 'uuid';
import { isAdminOrAbove } from './guard.utils';

export function makeAiIntegrationsAdminGuard(aiIntegrationId: string) {
  return async (user: UserProfileResp): Promise<boolean> => {
    if (!uuidValidate(aiIntegrationId)) {
      return false;
    }

    const aiIntegration =
      await aiIntegrationsService.getAiIntegration(aiIntegrationId);

    const userOrg = user.orgs.find((org) => org.id === aiIntegration.orgId);

    return !!userOrg && isAdminOrAbove(userOrg.role);
  };
}
