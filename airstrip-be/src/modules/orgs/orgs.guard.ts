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

export function OrgsGuard(allowedMinimumRole: AllowedMinimumRole): CanActivate {
  @Injectable()
  class OrgsGuardInner implements CanActivate {
    /**
     * Checks user has access to org. Must be used on URLs that have an orgId path param.
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

      return !!userOrg && isUserRoleAllowed(userOrg.role, allowedMinimumRole);
    }
  }

  return mixin(OrgsGuardInner) as unknown as CanActivate;
}
