import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrgUserEntity } from './org-user.entity';

@Entity({
  name: 'organizations',
})
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToMany(() => OrgUserEntity, (orgUser) => orgUser.org, {
    eager: false,
  })
  orgUsers?: OrgUserEntity[];
}
