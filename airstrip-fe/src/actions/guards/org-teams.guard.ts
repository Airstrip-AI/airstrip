import { InjectableGuard } from '@/actions/auth.guard';
import * as orgTeamsService from '@/services/org-teams';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { validate as uuidValidate } from 'uuid';
import { isAdminOrAbove } from './guard.utils';

/**
 * Note to be confused with {@link OrgTeamsMemberGuard}.
 * Checks user is member of org that org team belongs to.
 * Must be used on URLs that have an orgTeamId path param.
 */
export function makeOrgTeamsOrgMemberGuard(orgTeamId: string): InjectableGuard {
  return async function (user: UserProfileResp) {
    if (!uuidValidate(orgTeamId)) {
      return false;
    }

    const orgTeamEntity = await orgTeamsService.getOrgTeamById(orgTeamId);

    return !!user.orgs.find((org) => org.id === orgTeamEntity.orgId);
  };
}

export function makeOrgTeamsMemberGuard(orgTeamId: string): InjectableGuard {
  /**
   * Checks user is org team member.
   * Must be used on URLs that have an orgTeamId path param.
   */
  return async function (user) {
    if (!orgTeamId) {
      throw new Error('Missing orgTeamId');
    }
    if (!uuidValidate(orgTeamId)) {
      return false;
    }

    if (!user) {
      throw new Error('Not authorized');
    }

    const orgTeamEntity = await orgTeamsService.getOrgTeamById(orgTeamId);

    const userOrg = user.orgs.find((org) => org.id === orgTeamEntity.orgId);

    const orgTeamUser = await orgTeamsService.getOrgTeamUser(
      orgTeamId,
      user.id,
    );

    return !!orgTeamUser || (!!userOrg && isAdminOrAbove(userOrg.role));
  };
}

export function makeOrgTeamsAdminGuard(orgTeamId: string): InjectableGuard {
  /**
   * Checks user is org team admin.
   * Must be used on URLs that have an orgTeamId path param.
   */
  return async function (user) {
    if (!uuidValidate(orgTeamId)) {
      return false;
    }

    const orgTeamEntity = await orgTeamsService.getOrgTeamById(orgTeamId);

    const userOrg = user.orgs.find((org) => org.id === orgTeamEntity.orgId);
    const isOrgAdmin = !!userOrg && isAdminOrAbove(userOrg.role);

    const orgTeamUser = await orgTeamsService.getOrgTeamUser(
      orgTeamId,
      user.id,
    );
    const isTeamAdmin = !!orgTeamUser && isAdminOrAbove(orgTeamUser.role);

    return isOrgAdmin || isTeamAdmin;
  };
}
