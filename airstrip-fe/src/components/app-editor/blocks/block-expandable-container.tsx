import { Accordion, Box, Group } from '@mantine/core';
import { Icon, IconProps } from '@tabler/icons-react';
import {
  ForwardRefExoticComponent,
  PropsWithChildren,
  ReactNode,
  RefAttributes,
} from 'react';

interface Props {
  IconComp: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  title: ReactNode;
}

export default function BlockExpandableContainer({
  IconComp,
  title,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Accordion variant="contained" flex={1}>
      <Accordion.Item value="container">
        <Accordion.Control>
          <Group>
            <IconComp size="1em" />
            <Box>{title}</Box>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>{children}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
