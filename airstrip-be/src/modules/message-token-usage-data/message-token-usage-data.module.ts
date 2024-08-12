import { Module } from '@nestjs/common';
import { MessageTokenUsageDataController } from './message-token-usage-data.controller';
import { MessageTokenUsageDataService } from './message-token-usage-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageTokenUsageDataEntity } from './message-token-usage-data.entity';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageTokenUsageDataEntity]),
    ChatMessagesModule,
  ],
  controllers: [MessageTokenUsageDataController],
  providers: [MessageTokenUsageDataService],
  exports: [MessageTokenUsageDataService],
})
export class MessageTokenUsageDataModule {}
