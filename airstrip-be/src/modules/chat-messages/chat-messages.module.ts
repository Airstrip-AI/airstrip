import { Module } from '@nestjs/common';
import { ChatMessagesController } from './chat-messages.controller';
import { ChatMessagesService } from './chat-messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './chat.entity';
import { ChatMessageEntity } from './chat-message.entity';
import { AppsModule } from '../apps/apps.module';
import { OrgTeamsModule } from '../org-teams/org-teams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, ChatMessageEntity]),
    AppsModule,
    OrgTeamsModule,
  ],
  controllers: [ChatMessagesController],
  providers: [ChatMessagesService],
  exports: [ChatMessagesService],
})
export class ChatMessagesModule {}
