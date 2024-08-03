import { OrganizationEntity } from '../../orgs/organization.entity';
import { OrgUserEntity } from '../../orgs/org-user.entity';
import { UserEntity } from '../user.entity';

type OrganizationUserWithOrg = Omit<OrgUserEntity, 'org'> & {
  org: OrganizationEntity;
};

export type UserWithOrgs = Omit<UserEntity, 'userOrgs'> & {
  userOrgs: OrganizationUserWithOrg[];
};
