'use client';

import { Anchor, Breadcrumbs as MantineBreadcrumbs } from '@mantine/core';

export default function Breadcrumbs({
  items,
}: {
  items: {
    title: string;
    href: string;
  }[];
}) {
  return (
    <MantineBreadcrumbs>
      {items.map((item, index) => (
        <Anchor
          href={item.href}
          key={index}
          style={{ textDecoration: 'none' }}
          c="blue"
        >
          {item.title}
        </Anchor>
      ))}
    </MantineBreadcrumbs>
  );
}
