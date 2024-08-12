import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as uuidValidate } from 'uuid';
import { AuthedUser } from '../auth/types/service';
import { OrgTeamsService } from './org-teams.service';
import { isAdminOrAbove } from '../../utils/constants';

@Injectable()
export class OrgTeamsOrgMemberGuard implements CanActivate {
  constructor(private readonly orgTeamsService: OrgTeamsService) {}

  /**
   * Note to be confused with {@link OrgTeamsMemberGuard}.
   * Checks user is member of org that org team belongs to.
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

    const orgTeamEntity = await this.orgTeamsService.getOrgTeamById(orgTeamId);

    return !!user.orgs.find((org) => org.id === orgTeamEntity.orgId);
  }
}

@Injectable()
export class OrgTeamsMemberGuard implements CanActivate {
  constructor(private readonly orgTeamsService: OrgTeamsService) {}

  /**
   * Checks user is org team member.
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

    const orgTeamEntity = await this.orgTeamsService.getOrgTeamById(orgTeamId);

    const userOrg = user.orgs.find((org) => org.id === orgTeamEntity.orgId);

    const orgTeamUser = await this.orgTeamsService.getOrgTeamUser(
      orgTeamId,
      user.id,
    );

    return !!orgTeamUser || (!!userOrg && isAdminOrAbove(userOrg.role));
  }
}

@Injectable()
export class OrgTeamsAdminGuard implements CanActivate {
  constructor(private readonly orgTeamsService: OrgTeamsService) {}

  /**
   * Checks user is org team admin.
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

    const orgTeamEntity = await this.orgTeamsService.getOrgTeamById(orgTeamId);

    const userOrg = user.orgs.find((org) => org.id === orgTeamEntity.orgId);
    const isOrgAdmin = !!userOrg && isAdminOrAbove(userOrg.role);

    const orgTeamUser = await this.orgTeamsService.getOrgTeamUser(
      orgTeamId,
      user.id,
    );
    const isTeamAdmin = !!orgTeamUser && isAdminOrAbove(orgTeamUser.role);

    return isOrgAdmin || isTeamAdmin;
  }
}
