import { UserRole } from '@/utils/backend/client/common/types';

export class CreateOrgTeamReq {
  orgId: string;
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

export class OrgTeamEntity {
  id: string;
  orgId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
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
  joinedOrgAt: string;
  teamRole: UserRole | null;
}

export class GetOrgUserAndTeamMembershipResp {
  data: OrgUserAndTeamMembershipResp[];
  nextPageCursor: string | null;
}

export class UserOrgTeamResp {
  teamId: string;
  orgId: string;
  userId: string;
  role: UserRole;
  name: string;
}

export class GetUserOrgTeamsResp {
  data: UserOrgTeamResp[];
}
