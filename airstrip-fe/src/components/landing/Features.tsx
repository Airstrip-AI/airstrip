'use client';

import { Card, Container, rem, SimpleGrid, Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';

const features: { title: string; benefits: ReactNode }[] = [
  {
    title: 'Multiple AI integrations made easy',
    benefits: (
      <>
        <Text>
          Bring your own API keys and connect to OpenAI, Anthropic, Gemini,
          self-hosted LLMs, and more.
        </Text>
        <Text>
          Switch between AI integrations with a single click. Test different AI
          models and see which one works best for your use case.
        </Text>
      </>
    ),
  },
  {
    title: 'Manage teams and control access',
    benefits: (
      <Text>
        Manage teams and control access to different AI integrations, API keys,
        and internal AI apps.
      </Text>
    ),
  },
  {
    title: 'Build internal AI apps and tools effortlessly',
    benefits: (
      <>
        <Text>
          <b>Both engineering and business teams</b> can build internal AI apps
          easily. Use the apps via a chat UI.
        </Text>
        <Text fw="500">
          We are working on REST API endpoints for the apps. Stay tuned!
        </Text>
      </>
    ),
  },
  {
    title: 'All-in-one AI management',
    benefits: (
      <Text>
        Monitor usage and metrics of your AI integrations and internal AI apps
        all in one place. No more pulling usage data from multiple places.
      </Text>
    ),
  },
];

export default function Features() {
  return (
    <Container size="75%">
      <Text ta="center" size={rem(24)}>
        Why Airstrip?
      </Text>
      <Text ta="center" size={rem(36)} fw="400" mt="lg">
        Let your AI management take flight.
      </Text>
      <SimpleGrid cols={{ base: 1, md: 2 }} mt="xl">
        {features.map((feature, index) => (
          <Card key={index} style={{ backgroundColor: '#f4f8fb' }}>
            <Stack gap="xl">
              <Text fw="400" size={rem(24)}>
                {feature.title}
              </Text>
              {feature.benefits}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
