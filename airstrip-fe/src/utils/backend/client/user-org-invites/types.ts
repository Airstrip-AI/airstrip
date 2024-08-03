import { UserRole } from '@/utils/backend/client/common/types';

export class AcceptOrRejectInviteReq {
  token: string;
  accept: boolean;
}

export class UserOrgInvite {
  id: string;
  email: string;
  role: UserRole;
  sentAt: string;
  orgName: string;
  token: string;
}

export class GetPendingUserOrgInvitesResp {
  data: UserOrgInvite[];
}
