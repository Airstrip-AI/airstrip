'use client';

import { Group, Text } from '@mantine/core';
import Image from 'next/image';
import classes from './Logo.module.css';
import Link from 'next/link';
import { Links } from '@/utils/misc/links';
import { PRODUCT_NAME } from '@/constants';
import logoImage from '../../../public/logo.svg';

export default function Logo({
  size,
  withText,
  withLink,
}: {
  size: number;
  withLink: boolean;
  withText: boolean;
}) {
  const logo = (
    <Group gap="0">
      <Image alt="Logo" src={logoImage} width={size} height={size} />
      {withText && <Text fw="bold">{PRODUCT_NAME}</Text>}
    </Group>
  );

  return withLink ? (
    <Link href={Links.landing()} className={classes.logoLink}>
      <Group>{logo}</Group>
    </Link>
  ) : (
    logo
  );
}
