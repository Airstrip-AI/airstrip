import { Controller, Get, Param, ParseUUIDPipe, Request } from '@nestjs/common';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { ApiResponse } from '@nestjs/swagger';
import { AppsUsageDataResponse } from './types/api';
import { AppsUsageDataServiceDto } from './types/service';
import { AuthedRequest } from '../auth/types/service';

@Controller()
export class DashboardAnalyticsController {
  constructor(
    private readonly dashboardAnalyticsService: DashboardAnalyticsService,
  ) {}

  /**
   * A very basic endpoint to get some usage data for apps in an org. Probably not enough for most real-world use cases.
   * Will be expanded in future iterations based on feedback and requirements.
   * This endpoint is accessible to authenticated users regardless of their role. They can only see
   * usage data for the apps they have access to. That means for org admins, they can see usage data for all apps.
   */
  @Get('orgs/:orgId/dashboard-analytics/apps-usage')
  @ApiResponse({ status: '2XX', type: AppsUsageDataResponse })
  async getAppsUsageData(
    @Request() req: AuthedRequest,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ): Promise<AppsUsageDataResponse> {
    const appsUsageData = await this.dashboardAnalyticsService.getAppsUsageData(
      req.user,
      orgId,
    );
    return this.appsUsageDataToResp(appsUsageData);
  }

  private appsUsageDataToResp(
    appsUsageData: AppsUsageDataServiceDto,
  ): AppsUsageDataResponse {
    return {
      data: appsUsageData.data.map((appUsageData) => ({
        app: {
          id: appUsageData.app.id,
          name: appUsageData.app.name,
        },
        totalUserMessages: appUsageData.totalUserMessages,
        totalAssistantMessages: appUsageData.totalAssistantMessages,
        tokensUsage: appUsageData.tokensUsage.map((tokenUsage) => ({
          aiProvider: tokenUsage.aiProvider,
          aiModel: tokenUsage.aiModel,
          totalPromptTokens: tokenUsage.totalPromptTokens,
          totalCompletionTokens: tokenUsage.totalCompletionTokens,
        })),
      })),
    };
  }
}
