import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../utils/constants';
import { UserEntity } from '../users/user.entity';
import { OrgTeamEntity } from './org-team.entity';

@Entity({
  name: 'org_team_users',
})
export class OrgTeamUserEntity {
  @PrimaryColumn({ name: 'org_team_id' })
  orgTeamId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({
    name: 'role',
  })
  role: UserRole;

  @Column({
    name: 'joined_team_at',
  })
  joinedTeamAt: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, {
    eager: false,
    nullable: false,
  })
  user?: UserEntity;

  @JoinColumn({ name: 'org_team_id' })
  @ManyToOne(() => OrgTeamEntity, {
    eager: false,
    nullable: false,
  })
  orgTeam?: OrgTeamEntity;
}
