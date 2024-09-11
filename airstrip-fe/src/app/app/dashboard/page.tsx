'use client';

import {
  getOrgModelsUsed,
  getOrgModelUsageData,
  OrgModelUsageData,
} from '@/actions/usage-data';
import { activeOrgIdKey } from '@/constants';
import { Card, Group, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { LineChart } from '@mantine/charts';

function ScalarValueComponent({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack gap="xs">
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Text fw="bold" size="xl">
        {value}
      </Text>
    </Stack>
  );
}

export default function DashboardPage() {
  const [activeOrgId, _] = useLocalStorage({
    key: activeOrgIdKey,
  });
  const [orgModels, setOrgModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [orgModelUsageData, setOrgModelUsageData] =
    useState<OrgModelUsageData | null>(null);

  useEffect(() => {
    if (activeOrgId) {
      getOrgModelsUsed(activeOrgId)
        .then((models) => setOrgModels(models))
        .catch((error) => console.error('Error fetching org models', error));
    }
  }, [activeOrgId]);

  useEffect(() => {
    setSelectedModel(orgModels[0] ?? null);
  }, [orgModels]);

  useEffect(() => {
    if (activeOrgId && selectedModel) {
      getOrgModelUsageData(activeOrgId, selectedModel)
        .then((data) => setOrgModelUsageData(data))
        .catch((error) =>
          console.error('Error fetching org usage data', error),
        );
    }
  }, [selectedModel]);

  return (
    <Stack>
      <Text fw="bold">Dashboard</Text>
      <Group>
        <Select
          allowDeselect={false}
          data={orgModels.map((model) => ({ value: model, label: model }))}
          value={selectedModel}
          onChange={setSelectedModel}
        />
      </Group>
      <SimpleGrid cols={{ sm: 1, md: 2 }}>
        <Card withBorder>
          <ScalarValueComponent
            label="Number of requests"
            value={orgModelUsageData?.num_requests.toString() ?? 'n/a'}
          />
        </Card>
        <Card withBorder>
          <ScalarValueComponent
            label="Total tokens used"
            value={orgModelUsageData?.total_tokens.toString() ?? 'n/a'}
          />
        </Card>
      </SimpleGrid>
      <SimpleGrid cols={{ sm: 1, md: 3 }}>
        <Card withBorder>
          <ScalarValueComponent
            label="Avg Prompt Tokens / Req"
            value={orgModelUsageData?.avgPromptTokensPerReq.toString() ?? 'n/a'}
          />
        </Card>
        <Card withBorder>
          <ScalarValueComponent
            label="Avg Completion Tokens / Req"
            value={
              orgModelUsageData?.avgCompletionTokensPerReq.toString() ?? 'n/a'
            }
          />
        </Card>
        <Card withBorder>
          <ScalarValueComponent
            label="Avg Total Tokens / Req"
            value={orgModelUsageData?.avgTotalTokensPerReq.toString() ?? 'n/a'}
          />
        </Card>
      </SimpleGrid>
      <SimpleGrid cols={{ sm: 1 }}>
        <Card withBorder>
          <Text c="dimmed" size="xs">
            Requests in the last 7 days
          </Text>
          <LineChart
            h={300}
            data={orgModelUsageData?.dailyStatsLastWeek ?? []}
            dataKey="day"
            series={[{ name: 'num_requests', color: 'indigo.6' }]}
            curveType="linear"
          />
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
