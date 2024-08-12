import { OrganizationEntity } from '../../orgs/organization.entity';
import { OrgInviteEntity } from '../org-invite.entity';

export type OrgInviteWithOrgJoined = OrgInviteEntity & {
  org: OrganizationEntity;
};
