import { activeOrgIdKey } from '@/constants';
import {
  useAppKbSources,
  useKbSources,
  useUpdateAppKbSources,
} from '@/hooks/queries/kb-sources';
import { notifyError, notifyOk } from '@/utils/notifications';
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  Group,
  Loader,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { IconCircleCheck, IconPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import classes from './attach-knowledge-base-button.module.css';
import NewKnowledgeBaseModal from './new-knowledge-base-modal';

interface Props {
  appId: string;
  disabled?: boolean;
}

export default function AttachKnowledgeBaseButton({ appId, disabled }: Props) {
  const [opened, { open, close }] = useDisclosure();
  const [orgId] = useLocalStorage({
    key: activeOrgIdKey,
  });

  return (
    <>
      <Drawer
        title={
          <Group>
            <Box>Knowledge Base</Box>
          </Group>
        }
        position="right"
        opened={opened}
        onClose={close}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack>
          <Button
            leftSection={<IconPlus size="1em" />}
            onClick={() => orgId && NewKnowledgeBaseModal.open({ orgId })}
            variant="outline"
            mr="auto"
          >
            Upload document
          </Button>

          {orgId && <KnowledgeBaseList orgId={orgId} appId={appId} />}
        </Stack>
      </Drawer>

      <Button onClick={open} disabled={!orgId || disabled}>
        Update Knowledge
      </Button>
    </>
  );
}

function KnowledgeBaseList({ orgId, appId }: { orgId: string; appId: string }) {
  const { data, isLoading } = useKbSources({
    orgId,
    onError: () => {
      notifyError('Failed to load knowledge bases');
    },
  });

  const { data: appKbSources } = useAppKbSources({
    appId,
    onError: () => {
      notifyError('Failed to load knowledge bases');
    },
  });

  useEffect(() => {
    const initialValues = {
      selectedSources: appKbSources?.map((source) => source.kbSourceId) || [],
    };

    form.setInitialValues(initialValues);
    form.setValues(initialValues);
  }, [appKbSources]);

  const { mutate: updateAppKbSources, isLoading: isUpdatingAppKbSources } =
    useUpdateAppKbSources({
      appId,
      onSuccess: () => {
        notifyOk('App knowledge updated');
      },
      onError: () => {
        notifyError('Failed to update app knowledge');
      },
    });

  const form = useForm<{ selectedSources: string[] }>({
    initialValues: {
      selectedSources: [],
    },
  });

  if (isLoading) {
    return (
      <>
        <Skeleton height={60} width="100%" />
        <Skeleton height={60} width="100%" />
        <Skeleton height={60} width="100%" />
      </>
    );
  }

  if (!data?.length) {
    return (
      <Text size="sm" c="dimmed">
        Knowledge base is empty.
      </Text>
    );
  }

  function doSave() {
    const { selectedSources } = form.getValues();

    updateAppKbSources({
      sourceIds: selectedSources,
    });
  }

  return (
    <>
      <Box c="dimmed" fz="sm">
        Which knowledge sources do you want the app to have access to?
      </Box>

      {data?.map((kb) => {
        const { id, name, processedAt } = kb;
        const foundIndex = form.values.selectedSources.findIndex(
          (val) => val === id,
        );
        const isChecked = foundIndex !== -1;

        return (
          <Checkbox.Card
            key={id}
            p="md"
            checked={isChecked}
            disabled={isUpdatingAppKbSources}
            onClick={() =>
              isChecked
                ? form.removeListItem('selectedSources', foundIndex)
                : form.insertListItem('selectedSources', id)
            }
          >
            <Group wrap="nowrap" align="flex-start">
              <Checkbox.Indicator />
              <div>
                <Text>{name}</Text>
              </div>
              {!!processedAt ? (
                <Tooltip label="Source is ready and can be used by app.">
                  <ThemeIcon
                    ml="auto"
                    size="xs"
                    variant="transparent"
                    color="gray"
                  >
                    <IconCircleCheck size="1em" />
                  </ThemeIcon>
                </Tooltip>
              ) : (
                <Tooltip label="Source is still being processed. You can attach it to an app first but it won't be used until it is ready.">
                  <Loader ml="auto" type="dots" size="xs" />
                </Tooltip>
              )}
            </Group>
          </Checkbox.Card>
        );
      })}

      <Button
        disabled={!form.isDirty()}
        loading={isUpdatingAppKbSources}
        onClick={doSave}
        className={classes.saveButton}
      >
        Save
      </Button>
    </>
  );
}
