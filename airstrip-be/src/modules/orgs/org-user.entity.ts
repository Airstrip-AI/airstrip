import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { OrganizationEntity } from './organization.entity';
import { UserRole } from '../../utils/constants';

@Entity({
  name: 'org_users',
})
export class OrgUserEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'org_id' })
  orgId: string;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, {
    eager: false,
    nullable: false,
  })
  user?: UserEntity;

  @JoinColumn({ name: 'org_id' })
  @ManyToOne(() => OrganizationEntity, {
    eager: false,
    nullable: false,
  })
  org?: OrganizationEntity;

  /**
   * The role of the user in the organization.
   */
  @Column({
    name: 'role',
  })
  role: UserRole;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'joined_org_at',
  })
  joinedOrgAt: Date;
}
