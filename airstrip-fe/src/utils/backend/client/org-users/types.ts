import { UserRole } from '@/utils/backend/client/common/types';

export class OrgUserResp {
  id: string;
  email: string;
  firstName: string;
  joinedOrgAt: string;
  role: UserRole;
}

export class GetOrgUsersResp {
  data: OrgUserResp[];
  total: number;
  nextPageCursor: string | null;
}

export class ChangeUserRoleReq {
  role: UserRole;
}
