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
import { AiIntegrationsService } from './ai-integrations.service';

export function AiIntegrationsGuard(
  allowedMinimumRole: AllowedMinimumRole,
): CanActivate {
  @Injectable()
  class AiIntegrationsGuardInner implements CanActivate {
    constructor(
      private readonly aiIntegrationsService: AiIntegrationsService,
    ) {}

    /**
     * Checks user has access to aiIntegration. Must be used on URLs that have an aiIntegrationId path param.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest() as Request;
      const aiIntegrationId = request.params.aiIntegrationId;

      if (!aiIntegrationId) {
        throw new UnauthorizedException('Missing aiIntegrationId');
      }
      if (!uuidValidate(aiIntegrationId)) {
        return false;
      }

      const user = request.user as AuthedUser;
      if (!user) {
        throw new UnauthorizedException('Not authorized');
      }

      const aiIntegration =
        await this.aiIntegrationsService.getAiIntegration(aiIntegrationId);

      const userOrg = user.orgs.find((org) => org.id === aiIntegration.orgId);

      return !!userOrg && isUserRoleAllowed(userOrg.role, allowedMinimumRole);
    }
  }

  return mixin(AiIntegrationsGuardInner) as unknown as CanActivate;
}
