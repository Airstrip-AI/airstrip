import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { AiProvider } from '../ai-integrations/types/common';

@Entity({
  name: 'message_token_usage_data',
})
export class MessageTokenUsageDataEntity {
  @PrimaryColumn({
    name: 'chat_message_id',
  })
  chatMessageId: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'ai_provider',
  })
  aiProvider: AiProvider;

  @Column({
    name: 'ai_model',
  })
  aiModel: string;

  @Column({
    name: 'org_id',
  })
  orgId: string;

  @Column({
    name: 'app_id',
    nullable: true,
    type: 'uuid',
  })
  appId: string | null;

  @Column({
    name: 'usage',
    type: 'jsonb',
  })
  usage: {
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}
