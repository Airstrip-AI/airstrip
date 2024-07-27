'use client';

import { Card, Container, rem, SimpleGrid, Stack, Text } from '@mantine/core';

const features: { title: string; description: string }[] = [
  {
    title: 'AI integrations made easy',
    description:
      'Bring your own API keys and connect to OpenAI, Anthropic, Gemini, and more (even self-hosted ones).',
  },
  {
    title: 'Manage teams and control access',
    description:
      'Manage teams and control access to different AI integrations, API keys, and internal AI apps.',
  },
  {
    title: 'Build internal AI apps/APIs',
    description:
      'Build chatbots or internal tools to extract structured data. Use the apps via a UI or call them with REST API endpoints.',
  },
  {
    title: 'Switch between AI integrations effortlessly',
    description:
      'Switch between AI integrations with a single click. Test different AI models and see which one works best for your use case.',
  },
  {
    title: 'View AI responses and refine prompts',
    description: 'View all responses and refine prompts easily in the webapp.',
  },
  {
    title: 'For everyone, not just engineering',
    description:
      'Both engineering and business teams can use Airstrip to build internal AI apps easily.',
  },
  {
    title: 'Monitor usage',
    description:
      'Monitor usage, metrics, and costs of your AI integrations and internal AI apps all in one place.',
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
              <Text>{feature.description}</Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
