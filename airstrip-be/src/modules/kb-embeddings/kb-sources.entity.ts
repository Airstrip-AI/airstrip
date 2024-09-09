import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { KbEmbeddingEntity } from './kb-embeddings.entity';

@Entity({
  name: 'knowledge_base_sources',
})
export class KbSourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'blob_key',
    type: 'text',
    nullable: false,
    comment: 'Key representing blob in storage',
  })
  blobKey: string;

  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;

  @Column({ name: 'content_type', type: 'text', nullable: false })
  contentType: string;

  @Column({
    name: 'size',
    type: 'int',
    nullable: false,
    comment: 'Size in bytes',
  })
  size: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @OneToMany(() => KbEmbeddingEntity, (kbEmbedding) => kbEmbedding.sourceId)
  embeddings: KbEmbeddingEntity[];

  @Column('timestamptz', {
    name: 'processed_at',
  })
  processedAt: Date;
}
