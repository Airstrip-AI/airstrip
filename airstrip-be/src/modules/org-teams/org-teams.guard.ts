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
import { OrgTeamsService } from './org-teams.service';

export function OrgTeamsGuard({
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
  class OrgTeamsGuardInner implements CanActivate {
    constructor(private readonly orgTeamsService: OrgTeamsService) {}

    /**
     * Checks user has access to orgTeam restricted by the minimum roles parameters.
     * Must be used on URLs that have an orgTeamId path param.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest() as Request;
      const orgTeamId = request.params.orgTeamId;

      if (!orgTeamId) {
        throw new UnauthorizedException('Missing orgTeamId');
      }
      if (!uuidValidate(orgTeamId)) {
        return false;
      }

      const user = request.user as AuthedUser;
      if (!user) {
        throw new UnauthorizedException('Not authorized');
      }

      const orgTeamEntity =
        await this.orgTeamsService.getOrgTeamById(orgTeamId);

      const userOrg = user.orgs.find((org) => org.id === orgTeamEntity.orgId);

      const orgTeamUser = await this.orgTeamsService.getOrgTeamUser(
        orgTeamId,
        user.id,
      );

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

  return mixin(OrgTeamsGuardInner) as unknown as CanActivate;
}
