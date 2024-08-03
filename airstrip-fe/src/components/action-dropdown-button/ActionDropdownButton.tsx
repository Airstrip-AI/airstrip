'use client';

import { ActionIcon, Menu, Text } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';

export type ActionMenuItemProps = {
  label: string;
  leftSection?: React.ReactNode;
  onClick?: () => void;
};

export default function ActionDropdownButton({
  basicActionMenuItems,
  dangerActionMenuItems,
}: {
  basicActionMenuItems: ActionMenuItemProps[];
  dangerActionMenuItems: ActionMenuItemProps[];
}) {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon size="sm" variant="transparent">
          <IconDots />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {basicActionMenuItems.map((item, index) => (
          <Menu.Item
            key={index}
            leftSection={item.leftSection}
            onClick={item.onClick}
          >
            <Text size="sm" fw={600}>
              {item.label}
            </Text>
          </Menu.Item>
        ))}

        {basicActionMenuItems.length && dangerActionMenuItems.length ? (
          <Menu.Divider />
        ) : null}

        {dangerActionMenuItems.map((item, index) => (
          <Menu.Item
            key={index}
            leftSection={item.leftSection}
            onClick={item.onClick}
          >
            <Text size="sm" fw={600} c="red">
              {item.label}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
