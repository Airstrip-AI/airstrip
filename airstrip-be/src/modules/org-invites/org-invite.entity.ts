import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationEntity } from '../orgs/organization.entity';
import { UserRole } from '../../utils/constants';

@Entity({
  name: 'org_invites',
})
export class OrgInviteEntity {
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
    name: 'inviter_id',
  })
  inviterId: string;

  @Column({
    name: 'email',
  })
  email: string;

  @Column({
    name: 'role',
  })
  role: UserRole;

  @Column({
    name: 'token',
  })
  token: string;

  @Column({
    name: 'accepted_at',
    nullable: true,
    type: 'timestamptz',
  })
  acceptedAt: Date | null;

  @JoinColumn({ name: 'org_id' })
  @ManyToOne(() => OrganizationEntity, {
    eager: false,
    nullable: false,
  })
  org?: OrganizationEntity;
}
