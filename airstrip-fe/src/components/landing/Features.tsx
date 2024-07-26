'use client';

import { Card, Container, SimpleGrid, Stack, Text } from '@mantine/core';

const features: { title: string; description: string }[] = [];

export default function Features() {
  return (
    <Container mt="lg" size="75%">
      <Text ta="center" size="24px">
        Why Airstrip?
      </Text>
      <Text ta="center" size="36px" fw="400" mt="lg">
        Let your AI management take flight.
      </Text>
      <SimpleGrid cols={{ base: 1, md: 3 }} mt="xl">
        {features.map((feature, index) => (
          <Card key={index} style={{ backgroundColor: '#f4f8fb' }}>
            <Stack gap="md">
              <Text fw="400" size="24px">
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
