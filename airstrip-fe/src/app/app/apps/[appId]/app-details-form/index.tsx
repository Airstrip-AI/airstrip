'use client';

import { useCheckUserPrivilegesForApp } from '@/hooks/queries/apps';
import type { AppEntity } from '@/services/apps';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { AppType } from '@/utils/backend/client/common/types';
import { isAdminOrAbove } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import {
  Button,
  Card,
  CopyButton,
  Group,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconExternalLink } from '@tabler/icons-react';
import UpdateAppForm from './update-app-form';

const formFieldLabel = (label: string) => (
  <Text fw="bold" size="sm">
    {label}
  </Text>
);

export default function AppDetailsForm({ app }: { app: AppEntity }) {
  const { data: userAppPrivileges } = useCheckUserPrivilegesForApp({
    appId: app.id,
  });

  const form = useForm<UpdateAppReq>({
    initialValues: {
      name: app.name,
      description: app.description,
      type: app.type,
      aiProviderId: app.aiProvider?.id || '',
      systemPrompt: app.systemPrompt || '',
      introductionMessage: app.introductionMessage || '',
      outputJsonSchema: app.outputJsonSchema || '',
      temperature: app.temperature,
      memory: app.memory,
      memoryQuery: app.memoryQuery,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
      description: (value) =>
        value.trim().length > 0 ? null : 'Description is required',
      type: (value) =>
        value === AppType.CHAT ? null : 'App type must be Chat',
      // type: (value) =>
      //   Object.values(AppType).includes(value)
      //     ? null
      //     : 'A valid app type is required',
      temperature: (value) =>
        value >= 0 && value <= 1 ? null : 'Temperature must be between 0 and 1',
    },
  });

  const appUserModeLink = new URL(
    Links.appUserMode(app.id),
    window.location.href,
  ).href;

  const canUpdateApp = userAppPrivileges?.accessLevel
    ? isAdminOrAbove(userAppPrivileges?.accessLevel)
    : false;

  return canUpdateApp ? (
    <UpdateAppForm form={form} app={app} appUserModeLink={appUserModeLink} />
  ) : (
    <Card withBorder padding="0">
      <Table withColumnBorders={false}>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td width="20%">{formFieldLabel('User mode link')}</Table.Td>
            <Table.Td>
              <Group>
                <Button
                  size="xs"
                  component="a"
                  target="_blank"
                  href={appUserModeLink}
                  variant="outline"
                >
                  <IconExternalLink />
                </Button>
                <CopyButton value={appUserModeLink}>
                  {({ copied, copy }) => (
                    <Button
                      variant="outline"
                      onClick={copy}
                      size="xs"
                      color={copied ? 'teal' : undefined}
                    >
                      {copied ? <IconCheck /> : 'Copy url'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>{formFieldLabel('Team')}</Table.Td>
            <Table.Td>
              <TextInput value={app.team?.name || 'Org-wide app'} disabled />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>{formFieldLabel('Name')}</Table.Td>
            <Table.Td>
              <TextInput {...form.getInputProps('name')} disabled />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Card>
  );
}
