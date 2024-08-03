import { Injectable } from '@nestjs/common';
import { OrgInvitesService } from '../org-invites/org-invites.service';
import { OrgInviteWithOrgJoined } from '../org-invites/types/service';
import { AuthedUser } from '../auth/types/service';

@Injectable()
export class UserOrgInvitesService {
  constructor(private readonly orgInvitesService: OrgInvitesService) {}

  async getPendingOrgInvitesForUser(
    email: string,
  ): Promise<OrgInviteWithOrgJoined[]> {
    return this.orgInvitesService.findPendingInvitesForEmail(
      email.toLowerCase(),
    );
  }

  async acceptOrRejectOrgInvite(
    token: string,
    authedUser: AuthedUser,
    accept: boolean,
  ): Promise<void> {
    await this.orgInvitesService.acceptOrRejectInvite(
      token,
      authedUser,
      accept,
    );
  }
}
