'use client';

import OrgMembersAndInvitesComponent from '@/components/users/OrgMembersAndInvitesComponent';
import OrgTeamsComponent from '@/components/users/OrgTeamsComponent';
import { useCurrentUser } from '@/hooks/queries/user-auth';
import { activeOrgIdKey } from '@/hooks/user';
import { isAdminOrAboveInOrg } from '@/utils/misc';
import { Card, rem, Tabs, Text } from '@mantine/core';
import { readLocalStorageValue } from '@mantine/hooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const tabKey = 'tab';

export default function UsersComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeOrgId = readLocalStorageValue<string>({
    key: activeOrgIdKey,
  });
  const { currentUser } = useCurrentUser();
  const [hasOrgAdminPrivileges, setHasOrgAdminPrivileges] =
    useState<boolean>(false);

  const userRole = currentUser?.orgs.find(
    (org) => org.id === activeOrgId,
  )?.role;

  useEffect(() => {
    setHasOrgAdminPrivileges(isAdminOrAboveInOrg(activeOrgId, currentUser));
  }, [activeOrgId, currentUser]);

  if (!currentUser || !userRole) {
    return null;
  }

  const redirectToTab = (tabValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(tabKey, tabValue);
    router.push(pathname + '?' + params.toString());
  };

  return (
    <Card withBorder>
      <Tabs
        defaultValue={searchParams.get(tabKey) || 'members'}
        orientation="vertical"
      >
        <Tabs.List>
          <Tabs.Tab value="members" onClick={() => redirectToTab('members')}>
            <Text fw="bold" size="sm">
              Members
            </Text>
          </Tabs.Tab>
          <Tabs.Tab value="teams" onClick={() => redirectToTab('teams')}>
            <Text fw="bold" size="sm">
              Teams
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          value="members"
          pl={rem(20)}
          style={{ overflowX: 'scroll' }}
        >
          <OrgMembersAndInvitesComponent
            orgId={activeOrgId}
            hasOrgAdminPrivileges={hasOrgAdminPrivileges}
            currentUser={currentUser}
            userRole={userRole}
          />
        </Tabs.Panel>
        <Tabs.Panel value="teams" pl={rem(20)} style={{ overflowX: 'scroll' }}>
          <OrgTeamsComponent
            orgId={activeOrgId}
            hasOrgAdminPrivileges={hasOrgAdminPrivileges}
          />
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
