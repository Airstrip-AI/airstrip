import { OrgInvite } from './types/api';
import { OrgInviteWithOrgJoined } from './types/service';

export function orgInviteEntityToOrgInvite(
  invite: OrgInviteWithOrgJoined,
): OrgInvite {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    sentAt: invite.createdAt,
    orgName: invite.org.name,
  };
}
