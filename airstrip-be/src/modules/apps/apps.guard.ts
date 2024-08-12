import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as uuidValidate } from 'uuid';
import { AuthedUser } from '../auth/types/service';
import { AppsService } from './apps.service';
import { OrgTeamsService } from '../org-teams/org-teams.service';
import { isAdminOrAbove } from '../../utils/constants';
import { CreateAppReq } from './types/api';

@Injectable()
export class AppsOrgMemberGuard implements CanActivate {
  constructor(private readonly appsService: AppsService) {}

  /**
   * Not to be confused with {@link AppsMemberGuard}.
   * Checks user is member of org that app belongs to.
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

    return !!user.orgs.find((org) => org.id === appEntity.orgId);
  }
}

@Injectable()
export class AppsMemberGuard implements CanActivate {
  constructor(
    private readonly appsService: AppsService,
    private readonly orgTeamsService: OrgTeamsService,
  ) {}

  /**
   * Checks user has usage access to app by checking either he is a member of the app's team or if he is org admin.
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

    if (!appEntity.teamId) {
      // org-wide app, check if user is in org
      return !!userOrg;
    } else {
      // team app, check if user is in team OR if user is org admin
      const orgTeamUser = await this.orgTeamsService.getOrgTeamUser(
        appEntity.teamId,
        user.id,
      );
      return !!orgTeamUser || (!!userOrg && isAdminOrAbove(userOrg.role));
    }
  }
}

@Injectable()
export class AppsAdminGuard implements CanActivate {
  constructor(
    private readonly appsService: AppsService,
    private readonly orgTeamsService: OrgTeamsService,
  ) {}

  /**
   * Checks user has admin rights on the app.
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
    const isOrgAdmin = !!userOrg && isAdminOrAbove(userOrg.role);

    if (!appEntity.teamId) {
      // org-wide app, check if user is org admin
      return isOrgAdmin;
    } else {
      // team app, check if user is team admin or org admin
      const orgTeamUser = await this.orgTeamsService.getOrgTeamUser(
        appEntity.teamId,
        user.id,
      );
      const isTeamAdmin = !!orgTeamUser && isAdminOrAbove(orgTeamUser.role);
      return isTeamAdmin || isOrgAdmin;
    }
  }
}

@Injectable()
export class AppsAdminCreationGuard implements CanActivate {
  constructor(private readonly orgTeamsService: OrgTeamsService) {}

  /**
   * Checks user is allowed to create the app in his request. This checks either user has
   * org admin role in the org or team admin role (in the team specified in the request body).
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

    const userOrg = user.orgs.find((org) => org.id === orgId);
    const isOrgAdmin = !!userOrg && isAdminOrAbove(userOrg.role);

    let isTeamAdmin = false;
    if (createAppReq.teamId) {
      const orgTeamEntity = await this.orgTeamsService.getOrgTeamById(
        createAppReq.teamId,
      );

      if (orgTeamEntity.orgId !== orgId) {
        throw new UnauthorizedException('Team does not belong to the org');
      }

      const orgTeamUser = await this.orgTeamsService.getOrgTeamUser(
        orgTeamEntity.id,
        user.id,
      );

      isTeamAdmin = !!orgTeamUser && isAdminOrAbove(orgTeamUser.role);
    }

    return isOrgAdmin || isTeamAdmin;
  }
}
