'use client';

import { Avatar, Group, UnstyledButton, Text, Pill, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { forwardRef } from 'react';

export interface UserButtonProps
  extends React.ComponentPropsWithoutRef<'button'> {
  initials: string;
  name: string;
  email: string;
  activeOrg: string;
}

export const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ initials, name, email, activeOrg, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      style={{
        padding: 'var(--mantine-spacing-md)',
        color: 'var(--mantine-color-text)',
        borderRadius: 'var(--mantine-radius-sm)',
      }}
      {...others}
    >
      <Group>
        <Avatar color="cyan">{initials}</Avatar>

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {name}
          </Text>

          <Text c="dimmed" size="xs">
            {email}
          </Text>
        </div>

        <IconChevronRight size="1rem" />
      </Group>
      <Group mt={rem(10)}>
        <Text c="dimmed" size="xs">
          {activeOrg}
        </Text>
        <Pill>Current org</Pill>
      </Group>
    </UnstyledButton>
  ),
);
