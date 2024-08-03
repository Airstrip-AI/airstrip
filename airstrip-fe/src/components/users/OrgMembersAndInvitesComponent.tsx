'use client';

import OrgInvitesComponent from '@/components/users/OrgInvitesComponent';
import OrgMembersComponent from '@/components/users/OrgMembersComponent';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { UserRole } from '@/utils/backend/client/common/types';
import { Stack } from '@mantine/core';

type OrgMembersAndInvitesComponentProps = {
  orgId: string;
  hasOrgAdminPrivileges: boolean;
  currentUser: UserProfileResp;
  userRole: UserRole;
};

export default function OrgMembersAndInvitesComponent({
  orgId,
  hasOrgAdminPrivileges,
  currentUser,
  userRole,
}: OrgMembersAndInvitesComponentProps) {
  return (
    <Stack gap="xl">
      {hasOrgAdminPrivileges && <OrgInvitesComponent orgId={orgId} />}
      <OrgMembersComponent
        orgId={orgId}
        hasOrgAdminPrivileges={hasOrgAdminPrivileges}
        currentUser={currentUser}
        userRole={userRole}
      />
    </Stack>
  );
}
