import { OrganizationEntity } from '../../orgs/organization.entity';
import { OrgInviteEntity } from '../org-invite.entity';

export type OrgInviteWithOrgJoined = Omit<OrgInviteEntity, 'org'> & {
  org: OrganizationEntity;
};
