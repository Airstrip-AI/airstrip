import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppType } from './types/common';
import { OrganizationEntity } from '../orgs/organization.entity';
import { OrgTeamEntity } from '../org-teams/org-team.entity';
import { AiIntegrationEntity } from '../ai-integrations/ai-integration.entity';

@Entity({
  name: 'apps',
})
export class AppEntity {
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

  @Column({
    name: 'team_id',
    nullable: true,
    type: 'text',
  })
  teamId: string | null;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'description',
  })
  description: string;

  @Column({
    name: 'type',
  })
  type: AppType;

  @Column({
    name: 'ai_provider_id',
    nullable: true,
    type: 'uuid',
  })
  aiProviderId: string | null;

  @Column({
    name: 'system_prompt',
    nullable: true,
    type: 'text',
  })
  systemPrompt: string | null;

  @Column({
    name: 'introduction_message',
    nullable: true,
    type: 'text',
  })
  introductionMessage: string | null;

  @Column({
    name: 'output_json_schema',
    nullable: true,
    type: 'text',
  })
  outputJsonSchema: string | null;

  @JoinColumn({
    name: 'org_id',
  })
  @ManyToOne(() => OrganizationEntity, {
    eager: false,
    nullable: false,
  })
  org?: OrganizationEntity;

  @JoinColumn({
    name: 'team_id',
  })
  @ManyToOne(() => OrgTeamEntity, {
    eager: false,
    nullable: true,
  })
  orgTeam?: OrgTeamEntity | null;

  @JoinColumn({
    name: 'ai_provider_id',
  })
  @ManyToOne(() => AiIntegrationEntity, {
    eager: false,
    nullable: true,
  })
  aiProvider?: AiIntegrationEntity | null;

  @Column({
    name: 'temperature',
    type: 'float',
  })
  temperature: number;
}
