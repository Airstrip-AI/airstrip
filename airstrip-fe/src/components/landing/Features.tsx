'use client';

import { Card, Container, rem, SimpleGrid, Stack, Text } from '@mantine/core';

const features: { title: string; description: string }[] = [];

export default function Features() {
  return (
    <Container size="75%">
      <Text ta="center" size={rem(24)}>
        Why Airstrip?
      </Text>
      <Text ta="center" size={rem(36)} fw="400" mt="lg">
        Let your AI management take flight.
      </Text>
      <SimpleGrid cols={{ base: 1, md: 3 }} mt="xl">
        {features.map((feature, index) => (
          <Card key={index} style={{ backgroundColor: '#f4f8fb' }}>
            <Stack gap="md">
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
