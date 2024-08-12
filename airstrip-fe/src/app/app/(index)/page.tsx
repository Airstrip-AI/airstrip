'use client';

import { useGetAppsUsageData } from '@/hooks/queries/dashboard-analytics';
import { activeOrgIdKey } from '@/hooks/user';
import { showErrorNotification } from '@/utils/misc';
import { Card, SimpleGrid, Stack, Text } from '@mantine/core';
import { readLocalStorageValue } from '@mantine/hooks';
import { BarChart } from '@mantine/charts';

export default function AppIndexPage() {
  const activeOrgId = readLocalStorageValue<string>({
    key: activeOrgIdKey,
  });

  const { data: appsUsageDataResp } = useGetAppsUsageData({
    orgId: activeOrgId,
    onSuccess: (results) => {},
    onError: (error) =>
      showErrorNotification(error.message || 'Failed to fetch data'),
  });

  if (!appsUsageDataResp) {
    return null;
  }

  return (
    <Stack>
      <Text fw="bold">Apps usage</Text>
      {appsUsageDataResp.data.length ? (
        <SimpleGrid cols={{ sm: 1, md: 3, lg: 4 }}>
          {appsUsageDataResp.data.map((appUsageData) => (
            <Card withBorder key={appUsageData.app.id}>
              <Text fw="bold">{appUsageData.app.name}</Text>
              <BarChart
                h={200}
                barProps={{
                  minPointSize: 3,
                  barSize: 20,
                }}
                withLegend
                data={[
                  {
                    totalMessages: 'Total messages',
                    User: appUsageData.totalUserMessages,
                    Assistant: appUsageData.totalAssistantMessages,
                  },
                ]}
                dataKey="totalMessages"
                series={[
                  { name: 'User', color: 'violet.6' },
                  { name: 'Assistant', color: 'blue.6' },
                ]}
                tickLine="y"
              />
              <BarChart
                h={200}
                barProps={{
                  minPointSize: 3,
                  barSize: 20,
                }}
                withLegend
                data={appUsageData.tokensUsage.map((usage) => ({
                  aiProviderModel: `${usage.aiProvider} (${usage.aiModel})`,
                  'Prompt tokens': usage.totalPromptTokens,
                  'Completion Tokens': usage.totalCompletionTokens,
                }))}
                dataKey="aiProviderModel"
                series={[
                  { name: 'Prompt tokens', color: 'violet.6' },
                  { name: 'Completion Tokens', color: 'blue.6' },
                ]}
                tickLine="y"
              />
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Text>Looks like you have not created any apps yet.</Text>
      )}
    </Stack>
  );
}
