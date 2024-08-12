import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as uuidValidate } from 'uuid';
import { AuthedUser } from '../auth/types/service';
import { OrgInvitesService } from './org-invites.service';
import { isAdminOrAbove } from '../../utils/constants';

@Injectable()
export class OrgInvitesAdminGuard implements CanActivate {
  constructor(private readonly orgInvitesService: OrgInvitesService) {}

  /**
   * Checks user has admin rights to orgInvite's org. Must be used on URLs that have an orgInviteId path param.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const orgInviteId = request.params.orgInviteId;

    if (!orgInviteId) {
      throw new UnauthorizedException('Missing orgInviteId');
    }
    if (!uuidValidate(orgInviteId)) {
      return false;
    }

    const user = request.user as AuthedUser;
    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const orgInvite =
      await this.orgInvitesService.getOrgInviteById(orgInviteId);
    if (!orgInvite) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userOrg = user.orgs.find((org) => org.id === orgInvite.orgId);

    return !!userOrg && isAdminOrAbove(userOrg.role);
  }
}
