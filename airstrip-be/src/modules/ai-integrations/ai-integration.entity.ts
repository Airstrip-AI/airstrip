import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AiProvider } from './types/common';
import { OrgTeamEntity } from '../org-teams/org-team.entity';

@Entity({
  name: 'ai_integrations',
})
export class AiIntegrationEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'org_id',
  })
  orgId: string;

  /**
   * Null means unrestricted to any team.
   */
  @Column({
    name: 'restricted_to_team_id',
    type: 'uuid',
    nullable: true,
  })
  restrictedToTeamId: string | null;

  @JoinColumn({
    name: 'restricted_to_team_id',
  })
  @ManyToOne(() => OrgTeamEntity, {
    eager: false,
    nullable: true,
  })
  restrictedToTeam?: OrgTeamEntity | null;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'description',
  })
  description: string;

  @Column({
    name: 'ai_provider',
  })
  aiProvider: AiProvider;

  /**
   * NOTE: This does not store the actual key, but a reference to the key stored in the secrets vault.
   */
  @Column({
    name: 'ai_provider_api_key',
  })
  aiProviderKeyVaultKey: string;

  @Column({
    name: 'ai_provider_api_url',
    type: 'text',
    nullable: true,
  })
  aiProviderApiUrl: string | null;

  @Column({
    name: 'ai_model',
  })
  aiModel: string;
}
