'use client';

import { ActionIcon, Box, Menu } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { useState } from 'react';

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
  const [opened, setOpened] = useState(false);

  return (
    <Menu shadow="md" width={200} opened={opened} onChange={setOpened}>
      <Menu.Target>
        <ActionIcon
          size="sm"
          variant="transparent"
          onClick={(ev) => {
            ev.preventDefault();
            setOpened((value) => !value);
          }}
        >
          <IconDots />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        {basicActionMenuItems.map((item, index) => (
          <Menu.Item
            key={index}
            leftSection={item.leftSection}
            onClick={item.onClick}
          >
            <Box fz="sm" fw={600}>
              {item.label}
            </Box>
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
            c="red"
          >
            <Box fz="sm" fw={600}>
              {item.label}
            </Box>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
