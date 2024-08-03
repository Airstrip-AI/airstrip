import { UserRole } from '@/utils/backend/client/common/types';

export class OrgInvitesReq {
  emails: string[];
  role: UserRole;
}

export class OrgInvite {
  id: string;
  email: string;
  role: UserRole;
  sentAt: string;
  orgName: string;
}

export class GetPendingOrgInvitesResp {
  data: OrgInvite[];
  nextPageCursor: string | null;
}
