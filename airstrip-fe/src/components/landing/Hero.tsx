'use client';

import { AspectRatio, Card, Container, Flex, rem, Text } from '@mantine/core';
import GetStartedButton from './GetStartedButton';
import AbstractDotsAnimation from '../animations/AbstractDotsAnimation';
import GithubRepoButton from '@/components/github-repo-button/GithubRepoButton';

export default function Hero() {
  return (
    <Container>
      <div style={{ position: 'relative' }}>
        <Flex justify="center" style={{ opacity: 0.2 }}>
          <AbstractDotsAnimation size={500} loop={true} />
        </Flex>
        <div style={{ position: 'absolute', top: '0%' }}>
          <Text fw="400" size={rem(48)} pt={rem(150)} ta="center">
            Open-source Enterprise AI Management Platform
          </Text>
          <Text size={rem(18)} pt={rem(20)} ta="center" c="dimmed">
            Manage your AI integrations, control access, and build internal AI
            apps with ease.
          </Text>
          <Flex gap="sm" pt={rem(40)} justify="center">
            <GithubRepoButton />
            <GetStartedButton />
          </Flex>
        </div>
      </div>
      <Card p={0} w="100%" withBorder shadow="lg" mb="xl">
        <AspectRatio w="100%" ratio={1.78}>
          <video src="/airstrip-demo.mp4" controls loop width="100%" />
        </AspectRatio>
      </Card>
    </Container>
  );
}
