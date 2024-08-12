import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as uuidValidate } from 'uuid';
import { AuthedUser } from '../auth/types/service';
import { AiIntegrationsService } from './ai-integrations.service';
import { isAdminOrAbove } from '../../utils/constants';

@Injectable()
export class AiIntegrationsAdminGuard implements CanActivate {
  constructor(private readonly aiIntegrationsService: AiIntegrationsService) {}

  /**
   * Checks user has admin rights to aiIntegration's org. Must be used on URLs that have an aiIntegrationId path param.
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

    return !!userOrg && isAdminOrAbove(userOrg.role);
  }
}
