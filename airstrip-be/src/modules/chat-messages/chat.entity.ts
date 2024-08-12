import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppEntity } from '../apps/app.entity';

@Entity({
  name: 'chats',
})
export class ChatEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'org_id',
  })
  orgId: string;

  @Column({
    name: 'app_id',
  })
  appId: string;

  @Column({
    name: 'user_id',
    nullable: true,
    type: 'uuid',
  })
  userId: string | null;

  @JoinColumn({ name: 'app_id' })
  @ManyToOne(() => AppEntity, {
    eager: false,
    nullable: false,
  })
  app?: AppEntity;
}
