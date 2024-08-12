import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatEntity } from './chat.entity';

@Entity({
  name: 'chat_messages',
})
export class ChatMessageEntity {
  @PrimaryGeneratedColumn()
  id: string;

  // Not CreateDateColumn because we expect to receive this from the frontend.
  @Column({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'chat_id',
  })
  chatId: string;

  @Column({
    name: 'role',
  })
  role: string;

  @Column({
    name: 'client_generated_id',
  })
  clientGeneratedId: string;

  @Column({
    name: 'content',
  })
  content: string;

  @Column({
    name: 'attachments',
    type: 'jsonb',
  })
  attachments:
    | {
        name?: string;
        contentType?: string;
        url: string;
      }[]
    | null;

  @JoinColumn({ name: 'chat_id' })
  @ManyToOne(() => ChatEntity, {
    eager: false,
    nullable: false,
  })
  chat?: ChatEntity;
}
