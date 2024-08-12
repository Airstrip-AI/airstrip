import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as uuidValidate } from 'uuid';
import { AuthedUser } from '../auth/types/service';
import { isAdminOrAbove } from '../../utils/constants';

@Injectable()
export class OrgsMemberGuard implements CanActivate {
  /**
   * Checks user is in org. Must be used on URLs that have an orgId path param.
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

    const user = request.user as AuthedUser;
    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    return !!user.orgs.find((org) => org.id === orgId);
  }
}

@Injectable()
export class OrgsAdminGuard implements CanActivate {
  /**
   * Checks user has admin rights in org. Must be used on URLs that have an orgId path param.
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

    const user = request.user as AuthedUser;
    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const userOrg = user.orgs.find((org) => org.id === orgId);

    return !!userOrg && isAdminOrAbove(userOrg.role);
  }
}
