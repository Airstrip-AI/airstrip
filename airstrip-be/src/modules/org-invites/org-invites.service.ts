import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgInviteEntity } from './org-invite.entity';
import { In, IsNull, Repository } from 'typeorm';
import { OrgInvitesReq } from './types/api';
import { OrgsService } from '../orgs/orgs.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { OrgInviteWithOrgJoined } from './types/service';
import { PRODUCT_NAME, UserRole } from '../../utils/constants';
import { AuthedUser } from '../auth/types/service';

export const ORG_INVITES_SERVICE_CONFIG = 'ORG_INVITES_SERVICE_CONFIG';

export type OrgInvitesServiceConfig = {
  frontendUrl: string;
};

@Injectable()
export class OrgInvitesService {
  private readonly logger = new Logger(OrgInvitesService.name);

  constructor(
    @Inject(ORG_INVITES_SERVICE_CONFIG)
    private readonly config: OrgInvitesServiceConfig,
    @InjectRepository(OrgInviteEntity)
    private orgInvitesRepository: Repository<OrgInviteEntity>,
    private readonly orgsService: OrgsService,
    private readonly emailService: EmailService,
  ) {}

  async inviteUsersToOrg(
    requesterId: string,
    orgId: string,
    invites: OrgInvitesReq,
  ) {
    const org = await this.orgsService.findOneById(orgId);

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    let emails = invites.emails.map((email) => email.toLowerCase());
    const existingInvites = new Set(
      (await this.findInvitesByEmailIn(orgId, emails)).map(
        (invite) => invite.email,
      ),
    );

    emails = emails.filter((email) => !existingInvites.has(email));

    const existingOrgUsers = new Set(
      (await this.orgsService.findOrgUsersByEmailIn(orgId, emails)).map(
        (orgUser) => orgUser.user!.email,
      ),
    );

    emails = emails.filter((email) => !existingOrgUsers.has(email));

    if (!emails.length) {
      return;
    }

    const orgInviteEntities = await this.createInvites(
      requesterId,
      orgId,
      emails,
      invites.role,
    );

    await Promise.all(
      orgInviteEntities.map(async (invite) => {
        try {
          await this.emailService.sendEmail({
            to: [
              {
                email: invite.email,
              },
            ],
            subject: `You are invited to join ${org.name} on ${PRODUCT_NAME}.`,
            htmlContent: `
              <p>Hello,</p>
              <p>You are invited to join <b>${org.name}</b>. Click on the <a href="${this.config.frontendUrl}/invites/${invite.token}?orgId=${invite.orgId}&email=${encodeURIComponent(invite.email)}">invitation link</a> to accept the invite.</p>
              <p>Note that the invite is only for this email address. You will be prompted to create an acount with this email if you do not already have one.</p>
              <p>Sincerely,<br>${PRODUCT_NAME}</p>
            `,
          });
        } catch (e) {
          this.logger.error(
            `Error sending email to invite (orgId=${invite.orgId}, email=${invite.email})`,
            e,
          );
        }
      }),
    );
  }

  async getPendingOrgInvites(
    orgId: string,
    page: number,
  ): Promise<{
    data: OrgInviteWithOrgJoined[];
    nextPageCursor: string | null;
  }> {
    const pageSize = 50;
    const data = (await this.orgInvitesRepository.find({
      where: {
        orgId,
        acceptedAt: IsNull(),
      },
      relations: {
        org: true,
      },
      order: {
        createdAt: 'ASC',
        email: 'ASC',
      },
      take: pageSize + 1,
      skip: page * pageSize,
    })) as OrgInviteWithOrgJoined[];

    return {
      data: data.slice(0, pageSize),
      nextPageCursor: data.length > pageSize ? String(page + 1) : null,
    };
  }

  async getOrgInviteById(inviteId: string): Promise<OrgInviteEntity | null> {
    return await this.orgInvitesRepository.findOne({
      where: {
        id: inviteId,
      },
    });
  }

  async cancelOrgInvite(inviteId: string): Promise<void> {
    const invite = await this.orgInvitesRepository.findOne({
      where: {
        id: inviteId,
        acceptedAt: IsNull(),
      },
    });

    if (invite) {
      await this.orgInvitesRepository.remove(invite);
    }
  }

  async findInvitesByEmailIn(
    orgId: string,
    emails: string[],
  ): Promise<OrgInviteEntity[]> {
    return await this.orgInvitesRepository.find({
      where: {
        orgId,
        email: In(emails),
      },
    });
  }

  async findPendingInvitesForEmail(
    email: string,
  ): Promise<OrgInviteWithOrgJoined[]> {
    return (await this.orgInvitesRepository.find({
      where: {
        email,
        acceptedAt: IsNull(),
      },
      relations: {
        org: true,
      },
    })) as OrgInviteWithOrgJoined[];
  }

  async findByUniqueToken(token: string): Promise<OrgInviteEntity | null> {
    return await this.orgInvitesRepository.findOne({
      where: {
        token,
      },
    });
  }

  async createInvites(
    inviterId: string,
    orgId: string,
    emails: string[],
    role: UserRole,
  ): Promise<OrgInviteEntity[]> {
    return await this.orgInvitesRepository.save(
      emails.map((email) => ({
        orgId,
        inviterId: inviterId,
        email: email.toLowerCase(),
        role: role,
        token: uuidv4(),
      })),
    );
  }

  async acceptOrRejectInvite(
    token: string,
    authedUser: AuthedUser,
    accept: boolean,
  ): Promise<void> {
    const invite = await this.orgInvitesRepository.findOne({
      where: {
        token,
        email: authedUser.email.toLowerCase(),
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (accept) {
      invite.acceptedAt = new Date();
      await this.orgInvitesRepository.manager.transaction(async (manager) => {
        const transactionalOrgInvitesRepo =
          manager.getRepository(OrgInviteEntity);
        await this.orgsService.addUserToOrg(
          invite.orgId,
          authedUser.id,
          invite.role,
          manager,
        );
        await transactionalOrgInvitesRepo.save(invite);
      });
    } else {
      await this.orgInvitesRepository.remove(invite);
    }
  }
}
