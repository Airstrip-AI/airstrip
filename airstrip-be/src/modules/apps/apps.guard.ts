import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as uuidValidate } from 'uuid';
import { AllowedMinimumRole, isUserRoleAllowed } from '../../utils/guards';
import { AuthedUser } from '../auth/types/service';
import { AppsService } from './apps.service';
import { OrgTeamsService } from '../org-teams/org-teams.service';

export function AppsGuard({
  teamMinimumRole,
  orgMinimumRole,
}: {
  /**
   * Minimum role required to access the team. Both fields are joined by OR operator.
   * If anyone in the org can access, regardless of whether they are in the team, set
   * both fields to '*'.
   *
   * A null value in either field means that if user does not have a role that passes the minimum role for
   * the OTHER field, they will not be able to access the resource.
   */
  teamMinimumRole: AllowedMinimumRole | null;
  orgMinimumRole: AllowedMinimumRole | null;
}): CanActivate {
  @Injectable()
  class AppsGuardInner implements CanActivate {
    constructor(
      private readonly appsService: AppsService,
      private readonly orgTeamsService: OrgTeamsService,
    ) {}

    /**
     * Checks user has access to apps restricted by the minimum roles parameters.
     * Must be used on URLs that have an appId path param.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest() as Request;
      const appId = request.params.appId;

      if (!appId) {
        throw new UnauthorizedException('Missing appId');
      }
      if (!uuidValidate(appId)) {
        return false;
      }

      const user = request.user as AuthedUser;
      if (!user) {
        throw new UnauthorizedException('Not authorized');
      }

      const appEntity = await this.appsService.getAppById(appId);

      const userOrg = user.orgs.find((org) => org.id === appEntity.orgId);

      const orgTeamUser = appEntity.teamId
        ? await this.orgTeamsService.getOrgTeamUser(appEntity.teamId, user.id)
        : null;

      return (
        (!!orgMinimumRole &&
          !!userOrg &&
          isUserRoleAllowed(userOrg.role, orgMinimumRole)) ||
        (!!teamMinimumRole &&
          !!orgTeamUser &&
          isUserRoleAllowed(orgTeamUser.role, teamMinimumRole))
      );
    }
  }

  return mixin(AppsGuardInner) as unknown as CanActivate;
}
