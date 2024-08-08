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
import { CreateAppReq } from './types/api';
import { OrgTeamsService } from '../org-teams/org-teams.service';
import { OrgTeamEntity } from '../org-teams/org-team.entity';

export function AppsCreationGuard({
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
  class AppsCreationGuardInner implements CanActivate {
    constructor(private readonly orgTeamsService: OrgTeamsService) {}

    /**
     * Checks user is allowed to create the app in his request. This checks either user has
     * org admin role in the org pointed by orgId path param, OR user has team admin role in the
     * team pointed by teamId in the request body.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest() as Request;
      const orgId = request.params.orgId;

      if (!orgId) {
        throw new UnauthorizedException('Missing orgId');
      }
      if (!uuidValidate(orgId)) {
        return false;
      }

      const createAppReq = request.body as CreateAppReq;
      if (!createAppReq) {
        throw new UnauthorizedException('Missing request body for "createApp"');
      } else if (createAppReq.teamId && !uuidValidate(createAppReq.teamId)) {
        throw new UnauthorizedException('Invalid teamId in request body.');
      }

      const user = request.user as AuthedUser;
      if (!user) {
        throw new UnauthorizedException('Not authorized');
      }

      let orgTeamEntity: OrgTeamEntity | null = null;
      if (createAppReq.teamId) {
        orgTeamEntity = await this.orgTeamsService.getOrgTeamById(
          createAppReq.teamId,
        );
      }
      // orgTeamEntity is allowed to be null here because createAppReq.teamId is optional. If it is a case of missing orgTeamEntity,
      // orgTeamsService.getOrgTeamById would have thrown an exception.

      if (orgTeamEntity && orgTeamEntity.orgId !== orgId) {
        throw new UnauthorizedException('Team does not belong to the org');
      }

      const userOrg = user.orgs.find((org) => org.id === orgId);

      const orgTeamUser = orgTeamEntity
        ? await this.orgTeamsService.getOrgTeamUser(orgTeamEntity.id, user.id)
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

  return mixin(AppsCreationGuardInner) as unknown as CanActivate;
}
