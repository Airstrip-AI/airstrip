'use client';

import { Button } from '@mantine/core';
import { IconArrowNarrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

export default function BackButton({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <Button
      leftSection={<IconArrowNarrowLeft size="1em" />}
      variant="subtle"
      component={Link}
      href={href}
      size="compact-xs"
    >
      {title}
    </Button>
  );
}
