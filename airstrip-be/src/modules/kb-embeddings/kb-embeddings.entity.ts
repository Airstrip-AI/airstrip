import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'knowledge_base_embeddings',
})
export class KbEmbeddingEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    name: 'source_id',
  })
  sourceId: string;

  @Column({
    name: 'content',
  })
  content: string;

  // This is actually a vector column but typeORM does not have support for it, so we label it as jsonb instead
  @Column('jsonb', {
    nullable: true,
    comment: 'Vector embedding with 1536 dimensions',
  })
  embedding: number[];

  @Column('jsonb', { name: 'metadata', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}
