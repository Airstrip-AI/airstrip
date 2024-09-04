import { Module } from '@nestjs/common';
import { AppChatsController } from './app-chats.controller';
import { AppChatsService } from './app-chats.service';
import { AppsModule } from '../apps/apps.module';
import { OrgTeamsModule } from '../org-teams/org-teams.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [AppsModule, OrgTeamsModule, EncryptionModule],
  controllers: [AppChatsController],
  providers: [AppChatsService],
})
export class AppChatsModule {}
