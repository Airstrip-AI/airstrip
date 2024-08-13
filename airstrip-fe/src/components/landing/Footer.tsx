'use client';

import { GITHUB_REPO_URL, PRODUCT_NAME } from '@/constants';
import { Container, Group, Text } from '@mantine/core';
import Image from 'next/image';
import Logo from '../logo/Logo';
import classes from './Footer.module.css';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Logo size={30} withText withLink />
        </div>
        <Group gap="sm">
          <Link href={GITHUB_REPO_URL} target="_blank">
            <Image alt="github" src="/github-mark.svg" width={20} height={20} />
          </Link>
          <Text c="dimmed" size="sm">
            © {new Date().getFullYear()} {PRODUCT_NAME}.
          </Text>
        </Group>
      </Container>
    </footer>
  );
}
