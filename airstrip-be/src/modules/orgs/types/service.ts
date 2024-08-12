import { OrgUserEntity } from '../org-user.entity';
import { UserEntity } from '../../users/user.entity';

export type OrganizationUserWithUser = OrgUserEntity & {
  user: UserEntity;
};
