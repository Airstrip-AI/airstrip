import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEntity } from './app.entity';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import {
  AppEntityWithOrgTeamAiProviderJoined,
  CreateAppServiceDto,
  UpdateAppServiceDto,
} from './types/service';
import { AuthedUser } from '../auth/types/service';
import { OrgTeamsService } from '../org-teams/org-teams.service';
import { AiIntegrationsService } from '../ai-integrations/ai-integrations.service';
import { AiIntegrationEntityWithOrgTeamJoined } from '../ai-integrations/types/service';
import { isAdminOrAbove, UserRole } from '../../utils/constants';

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(AppEntity) private appRepository: Repository<AppEntity>,
    private readonly orgTeamsService: OrgTeamsService,
    private readonly aiIntegrationsService: AiIntegrationsService,
  ) {}

  async createApp(
    orgId: string,
    dto: CreateAppServiceDto,
  ): Promise<AppEntityWithOrgTeamAiProviderJoined> {
    const orgTeam = dto.teamId
      ? await this.orgTeamsService.getOrgTeamById(dto.teamId)
      : null;
    if (orgTeam && orgTeam.orgId !== orgId) {
      throw new BadRequestException('Team does not belong to the organization');
    }

    const app = await this.appRepository.save({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      teamId: dto.teamId,
      orgId,
    });

    return this.getAppById(app.id);
  }

  async listAppsForUser(
    authedUser: AuthedUser,
    orgId: string,
    pagination: {
      page?: number;
      fetchAll?: boolean;
    },
  ): Promise<{
    data: AppEntityWithOrgTeamAiProviderJoined[];
    nextPageCursor: string | null;
  }> {
    const pageSize = 20;
    const orgRole = authedUser.orgs.find((o) => o.id === orgId)?.role;
    if (!orgRole) {
      throw new UnauthorizedException('User does not have access to org');
    }

    if (!pagination.fetchAll && pagination.page === undefined) {
      throw new BadRequestException('Page number is required');
    }

    let where: FindOptionsWhere<AppEntity>[];
    if (isAdminOrAbove(orgRole)) {
      // admin or above, can see all apps
      where = [
        {
          orgId,
        },
      ];
    } else {
      // not admin, can only see apps they have access to
      const authedUserTeamIds = (
        await this.orgTeamsService.getUserOrgTeams(orgId, authedUser.id)
      ).map((t) => t.orgTeamId);
      where = [
        {
          orgId,
          teamId: IsNull(),
        },
        ...(authedUserTeamIds.length
          ? [
              {
                orgId,
                teamId: In(authedUserTeamIds),
              },
            ]
          : []),
      ];
    }

    // pagination.page should not be undefined here if fetchAll is false because of the check above, but just in case fallback to 0
    const page = pagination.page || 0;

    const apps = await this.appRepository.find({
      where,
      ...(pagination.fetchAll
        ? {}
        : {
            take: pageSize + 1,
            skip: pageSize * page,
          }),
      relations: {
        org: true,
        orgTeam: true,
        aiProvider: true,
      },
    });

    return {
      data: (pagination.fetchAll
        ? apps
        : apps.slice(0, pageSize)) as AppEntityWithOrgTeamAiProviderJoined[],
      nextPageCursor: pagination.fetchAll
        ? null
        : apps.length > pageSize
          ? String(page + 1)
          : null,
    };
  }

  async updateApp(
    appId: string,
    dto: UpdateAppServiceDto,
  ): Promise<AppEntityWithOrgTeamAiProviderJoined> {
    const app = await this.appRepository.findOne({
      where: {
        id: appId,
      },
    });
    if (!app) {
      throw new NotFoundException('App not found');
    }
    app.name = dto.name;
    app.description = dto.description;
    app.type = dto.type;
    app.aiProviderId = dto.aiProviderId;
    app.systemPrompt = dto.systemPrompt;
    app.introductionMessage = dto.introductionMessage;
    app.outputJsonSchema = dto.outputJsonSchema;
    app.aiModel = dto.aiModel;
    app.temperature = dto.temperature;
    await this.appRepository.save(app);

    return this.getAppById(appId);
  }

  async getAppById(
    appId: string,
  ): Promise<AppEntityWithOrgTeamAiProviderJoined> {
    const app = await this.appRepository.findOne({
      where: {
        id: appId,
      },
      relations: {
        org: true,
        orgTeam: true,
        aiProvider: true,
      },
    });

    if (!app) {
      throw new NotFoundException('App not found');
    }

    return app as AppEntityWithOrgTeamAiProviderJoined;
  }

  async getAllowedAiProvidersForApp(appId: string): Promise<{
    data: AiIntegrationEntityWithOrgTeamJoined[];
  }> {
    const app = await this.appRepository.findOne({
      where: {
        id: appId,
      },
    });
    if (!app) {
      throw new NotFoundException('App not found');
    }

    if (app.teamId) {
      return await this.aiIntegrationsService.getAllAiIntegrationsAccessibleByTeam(
        app.teamId,
      );
    } else {
      return await this.aiIntegrationsService.getAllOrgWideAiIntegrations(
        app.orgId,
      );
    }
  }

  async checkUserPrivilegesForApp(
    user: AuthedUser,
    appId: string,
  ): Promise<{
    accessLevel: UserRole | null;
  }> {
    const app = await this.appRepository.findOne({
      where: {
        id: appId,
      },
    });
    if (!app) {
      throw new NotFoundException('App not found');
    }

    const userOrgRole = user.orgs.find((o) => o.id === app.orgId)?.role;
    if (!userOrgRole) {
      // should not happen, just in case
      throw new UnauthorizedException('User does not have access to app');
    }

    if (!app.teamId || isAdminOrAbove(userOrgRole)) {
      // org-level app or user has org-level admin access, just return org-level role
      return {
        accessLevel: userOrgRole,
      };
    } else {
      const userTeamRole = await this.orgTeamsService.getOrgTeamUser(
        app.teamId,
        user.id,
      );
      return {
        accessLevel: userTeamRole?.role || null,
      };
    }
  }
}
