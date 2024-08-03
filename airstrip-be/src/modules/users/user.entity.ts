import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrgUserEntity } from '../orgs/org-user.entity';

@Entity({
  name: 'users',
})
export class UserEntity {
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
    name: 'email',
  })
  email: string;

  @Column({
    name: 'password_hash',
  })
  passwordHash: string;

  @Column({
    name: 'first_name',
  })
  firstName: string;

  @Column({
    name: 'verified',
  })
  verified: boolean;

  @Column({
    name: 'verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  verifiedAt: Date | null;

  @Column({
    name: 'verify_token',
    type: 'text',
    nullable: true,
  })
  verifyToken: string | null;

  @Column({
    name: 'verify_token_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  verifyTokenExpiresAt: Date | null;

  @Column({
    name: 'reset_password_token',
    type: 'text',
    nullable: true,
  })
  resetPasswordToken: string | null;

  @Column({
    name: 'reset_password_token_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  resetPasswordTokenExpiresAt: Date | null;

  @OneToMany(() => OrgUserEntity, (orgUser) => orgUser.user, {
    eager: false,
  })
  userOrgs?: OrgUserEntity[];
}
