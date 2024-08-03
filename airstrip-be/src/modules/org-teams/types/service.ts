import { UserRole } from '../../../utils/constants';
import { UserEntity } from '../../users/user.entity';
import { OrgTeamUserEntity } from '../org-team-user.entity';
import { OrgTeamEntity } from '../org-team.entity';

export type CreateOrgTeamReq = {
  orgId: string;
  name: string;
  creatorId: string;
};

export type OrgTeamUserWithUserJoined = Omit<OrgTeamUserEntity, 'user'> & {
  user: UserEntity;
};

export type OrgTeamEntityWithAuthedUserRoleAndNumMembers = OrgTeamEntity & {
  // The authed user's role in this team. null means not a member.
  authedUserRole: UserRole | null;
  numMembers: number;
};
