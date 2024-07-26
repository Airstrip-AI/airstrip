'use client';

import { PRODUCT_NAME } from '@/constants';
import { Container, Flex, Text } from '@mantine/core';
import Logo from '../logo/Logo';
import classes from './Footer.module.css';

// TODO: add github link

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Logo size={30} withText withLink />
        </div>
        <Text c="dimmed" size="sm">
          © {new Date().getFullYear()} {PRODUCT_NAME}.
        </Text>
      </Container>
    </footer>
  );
}
