'use client';

import UserOrgInvitesComponent from '@/components/user-org-invites/UserOrgInvitesComponent';
import { Card } from '@mantine/core';

export default function InvitesPage() {
  return (
    <Card withBorder>
      <UserOrgInvitesComponent />
    </Card>
  );
}
