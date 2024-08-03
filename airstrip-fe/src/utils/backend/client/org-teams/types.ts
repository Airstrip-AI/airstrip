import { UserRole } from '@/utils/backend/client/common/types';

export class CreateOrgTeamReq {
  name: string;
}

export class AddOrgTeamUsersReq {
  userIds: string[];
  role: UserRole;
}

export class ChangeOrgTeamUserRoleReq {
  userId: string;
  role: UserRole;
}

export class OrgTeamResp {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  authedUserRole: UserRole | null;
  numMembers: number;
}

export class GetOrgTeamsResp {
  data: OrgTeamResp[];
  nextPageCursor: string | null;
}

export class OrgTeamUserResp {
  orgTeamId: string;
  userId: string;
  userFirstName: string;
  userEmail: string;
  orgId: string;
  role: UserRole;
  joinedTeamAt: string;
  updatedAt: string;
}

export class GetOrgTeamUsersResp {
  data: OrgTeamUserResp[];
  nextPageCursor: string | null;
}

export class OrgUserAndTeamMembershipResp {
  id: string;
  email: string;
  firstName: string;
  joinedOrgAt: Date;
  teamRole: UserRole | null;
}

export class GetOrgUserAndTeamMembershipResp {
  data: OrgUserAndTeamMembershipResp[];
  nextPageCursor: string | null;
}
