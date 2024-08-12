import { Module } from '@nestjs/common';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { OrgsModule } from '../orgs/orgs.module';
import { AppsModule } from '../apps/apps.module';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';
import { MessageTokenUsageDataModule } from '../message-token-usage-data/message-token-usage-data.module';

@Module({
  imports: [
    OrgsModule,
    AppsModule,
    ChatMessagesModule,
    MessageTokenUsageDataModule,
  ],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}
