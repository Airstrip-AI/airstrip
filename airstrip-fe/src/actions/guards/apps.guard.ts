import { InjectableGuard } from '@/actions/auth.guard';
import * as appsService from '@/services/apps';
import { UnauthorizedException } from '@/services/errors';
import * as orgTeamsService from '@/services/org-teams';
import { validate as uuidValidate } from 'uuid';
import { isAdminOrAbove } from './guard.utils';

export function makeAppsMemberGuard(appId: string): InjectableGuard {
  return async function (user) {
    if (!uuidValidate(appId)) {
      return false;
    }

    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const appEntity = await appsService.getAppById(appId);

    const userOrg = user.orgs.find((org) => org.id === appEntity.orgId);

    if (!appEntity.teamId) {
      // org-wide app, check if user is in org
      return !!userOrg;
    } else {
      // team app, check if user is in team OR if user is org admin
      const orgTeamUser = await orgTeamsService.getOrgTeamUser(
        appEntity.teamId,
        user.id,
      );
      return !!orgTeamUser || (!!userOrg && isAdminOrAbove(userOrg.role));
    }
  };
}

export function makeAppsAdminGuard(appId: string): InjectableGuard {
  return async function (user) {
    if (!uuidValidate(appId)) {
      return false;
    }

    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const appEntity = await appsService.getAppById(appId);

    const userOrg = user.orgs.find((org) => org.id === appEntity.orgId);
    const isOrgAdmin = !!userOrg && isAdminOrAbove(userOrg.role);

    if (!appEntity.teamId) {
      // org-wide app, check if user is org admin
      return isOrgAdmin;
    } else {
      // team app, check if user is team admin or org admin
      const orgTeamUser = await orgTeamsService.getOrgTeamUser(
        appEntity.teamId,
        user.id,
      );
      const isTeamAdmin = !!orgTeamUser && isAdminOrAbove(orgTeamUser.role);
      return isTeamAdmin || isOrgAdmin;
    }
  };
}
