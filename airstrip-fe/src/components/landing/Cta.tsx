'use client';

import { Card, Container, Flex, rem, Stack, Text } from '@mantine/core';
import GetStartedButton from './GetStartedButton';
import GithubRepoButton from '@/components/github-repo-button/GithubRepoButton';

export default function Cta() {
  return (
    <Container mt={rem(100)}>
      <Card style={{ backgroundColor: '#131111' }} p="xl">
        <Stack gap="lg">
          <Text ta="center" fw="400" size={rem(36)} c="#ffffff">
            Ready to take flight with Airstrip?
          </Text>
          <Text size={rem(18)} pt={rem(20)} ta="center" c="#ffffff">
            Start managing your AI integrations, control access, and build
            internal AI apps with ease.
          </Text>
          <Flex gap="sm" justify="center">
            <GithubRepoButton variant="white" />
            <GetStartedButton variant="white" />
          </Flex>
        </Stack>
      </Card>
    </Container>
  );
}
