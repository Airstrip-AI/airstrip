'use client';

import Logo from '@/components/logo/Logo';
import { UserButton } from '@/components/user-button/UserButton';
import { useCurrentUser } from '@/hooks/queries/user-auth';
import { useGetPendingOrgInvitesForUser } from '@/hooks/queries/user-org-invites';
import { activeOrgIdKey, useLogout } from '@/hooks/user';
import { isAdminOrAboveInOrg } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import {
  AppShell,
  Burger,
  Divider,
  Group,
  Indicator,
  LoadingOverlay,
  Menu,
  NavLink,
  Pill,
  Stack,
  rem,
} from '@mantine/core';
import { useLocalStorage, useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconLayoutDashboard,
  IconLogout,
  IconMail,
  IconPlugConnected,
  IconSwitchHorizontal,
  IconTerminal2,
  IconUsersGroup,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

const sideNav: {
  href: string;
  label: React.ReactNode;
  requiresOrgAdmin: boolean;
}[] = [
  {
    href: Links.apps(),
    label: (
      <Group>
        <IconTerminal2 />
        Apps
      </Group>
    ),
    requiresOrgAdmin: false,
  },
  {
    href: Links.dashboard(),
    label: (
      <Group>
        <IconLayoutDashboard />
        Dashboard
      </Group>
    ),
    requiresOrgAdmin: true,
  },
  {
    href: Links.users(),
    label: (
      <Group>
        <IconUsersGroup />
        Members & Teams
      </Group>
    ),
    requiresOrgAdmin: false,
  },
  {
    href: Links.aiIntegrations(),
    label: (
      <Group>
        <IconPlugConnected />
        AI Integrations
      </Group>
    ),
    requiresOrgAdmin: true,
  },
];

function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { data } = useGetPendingOrgInvitesForUser({});

  return (
    <>
      <NavLink
        component={Link}
        href={Links.invites()}
        active={pathname === Links.invites().split('?')[0]}
        label={
          data?.data.length ? (
            <Group>
              <Indicator
                inline
                label={data?.data.length}
                color="red"
                position="middle-end"
              >
                <IconMail />
              </Indicator>
              Invites
            </Group>
          ) : (
            <Group>
              <IconMail />
              Invites
            </Group>
          )
        }
        styles={{
          label: {
            fontWeight: 600,
          },
        }}
        style={{
          borderRadius: 5,
        }}
      />
      {sideNav
        .map((item, index) => {
          const itemPathname = item.href.split('?')[0];

          return !item.requiresOrgAdmin || isAdmin ? (
            <NavLink
              key={index}
              component={Link}
              href={item.href}
              active={pathname === itemPathname}
              label={item.label}
              styles={{
                label: {
                  fontWeight: 600,
                },
              }}
              style={{
                borderRadius: 5,
              }}
            />
          ) : null;
        })
        .filter(Boolean)}
    </>
  );
}

export default function Layout({ children }: PropsWithChildren) {
  const { logout } = useLogout();

  const { currentUser, loadingCurrentUser } = useCurrentUser();

  const [activeOrgId, setActiveOrgId] = useLocalStorage({
    key: activeOrgIdKey,
  });

  const [hasOrgAdminPrivileges, setHasOrgAdminPrivileges] =
    useState<boolean>(false);

  const [opened, { toggle }] = useDisclosure();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setHasOrgAdminPrivileges(isAdminOrAboveInOrg(activeOrgId, currentUser));
  }, [activeOrgId, currentUser]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 350,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Logo size={30} withText withLink />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Menu position={isSmallScreen ? 'bottom' : 'right'}>
            <Menu.Target>
              <UserButton
                initials={
                  currentUser?.firstName?.substring(0, 1)?.toUpperCase() ||
                  currentUser?.email?.substring(0, 1)?.toUpperCase() ||
                  ''
                }
                name={
                  currentUser?.firstName ||
                  currentUser?.email?.split('@')[0] ||
                  ''
                }
                email={currentUser?.email || ''}
                activeOrg={
                  currentUser?.orgs.find((org) => org.id === activeOrgId)
                    ?.name || ''
                }
              />
            </Menu.Target>
            <Menu.Dropdown>
              {/* TODO: update profile page. not important for now */}
              {/* <Menu.Item
                leftSection={
                  <IconUser style={{ width: rem(14), height: rem(14) }} />
                }
              >
                Profile
              </Menu.Item> */}
              {/* <Menu.Divider /> */}
              <Menu.Label>Organizations</Menu.Label>
              {currentUser?.orgs.map((org) => (
                <Menu.Item
                  key={org.id}
                  rightSection={
                    activeOrgId === org.id ? (
                      <Pill>Selected</Pill>
                    ) : (
                      <IconSwitchHorizontal
                        style={{
                          width: rem(14),
                          height: rem(14),
                        }}
                      />
                    )
                  }
                  onClick={
                    activeOrgId === org.id
                      ? undefined
                      : () => {
                          setActiveOrgId(org.id);
                        }
                  }
                >
                  {org.name}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item
                leftSection={
                  <IconLogout style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={logout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Divider />
          <NavLinks isAdmin={hasOrgAdminPrivileges} />
          <Divider />
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <>
          <LoadingOverlay visible={loadingCurrentUser} />
          {children}
        </>
      </AppShell.Main>
    </AppShell>
  );
}
