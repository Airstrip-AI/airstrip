import { Injectable } from '@nestjs/common';
import { AppsUsageDataServiceDto } from './types/service';
import { AppsService } from '../apps/apps.service';
import { ChatMessagesService } from '../chat-messages/chat-messages.service';
import { MessageTokenUsageDataService } from '../message-token-usage-data/message-token-usage-data.service';
import { AuthedUser } from '../auth/types/service';

@Injectable()
export class DashboardAnalyticsService {
  constructor(
    private readonly appsService: AppsService,
    private readonly chatMessagesService: ChatMessagesService,
    private readonly messageTokenUsageDataService: MessageTokenUsageDataService,
  ) {}

  async getAppsUsageData(
    authedUser: AuthedUser,
    orgId: string,
  ): Promise<AppsUsageDataServiceDto> {
    const apps = await this.appsService.listAppsForUser(authedUser, orgId, {
      fetchAll: true,
    });
    const appIds = apps.data.map((app) => app.id);
    const appMessageRoleCountsMap =
      await this.chatMessagesService.countAppMessagesByRole(appIds);
    const appTokensUsageMap =
      await this.messageTokenUsageDataService.countAppTokensUsageGroupByAiProviderAndModel(
        appIds,
      );

    return {
      data: apps.data.map((app) => ({
        app: {
          id: app.id,
          name: app.name,
        },
        totalUserMessages:
          appMessageRoleCountsMap.get(app.id)?.totalUserMessages || 0,
        totalAssistantMessages:
          appMessageRoleCountsMap.get(app.id)?.totalAssistantMessages || 0,
        tokensUsage: appTokensUsageMap.get(app.id) || [],
      })),
    };
  }
}
