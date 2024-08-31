import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { validate as uuidValidate } from 'uuid';
import { InjectableGuard } from '../auth.guard';
import { isAdminOrAbove } from './guard.utils';

export function makeOrgsMemberGuard(orgId: string): InjectableGuard {
  return async (user: UserProfileResp): Promise<boolean> => {
    if (!orgId) {
      throw new Error('Missing orgId');
    }
    if (!uuidValidate(orgId)) {
      return false;
    }

    return !!user.orgs.find((org) => org.id === orgId);
  };
}

export function makeOrgsAdminGuard(orgId: string): InjectableGuard {
  return async (user: UserProfileResp): Promise<boolean> => {
    if (!uuidValidate(orgId)) {
      return false;
    }

    const userOrg = user.orgs.find((org) => org.id === orgId);
    userOrg?.role;

    return !!userOrg && isAdminOrAbove(userOrg.role);
  };
}
