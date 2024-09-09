import { kbDocumentMaxSize, kbDocumentMaxSizeLabel } from '@/constants';
import { useCreateKbSource } from '@/hooks/queries/kb-sources';
import { formatSize } from '@/utils/misc';
import { notifyError, notifyOk } from '@/utils/notifications';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  rem,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  IconCloudUpload,
  IconDownload,
  IconPdf,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useRef } from 'react';
import classes from './new-knowledge-base-modal.module.css';

interface Props {
  orgId: string;
}

export default function NewKnowledgeBaseModal({ orgId }: Props) {
  const theme = useMantineTheme();
  const openRef = useRef<() => void>(null);
  const form = useForm<{
    name: string;
    file?: File;
  }>({
    initialValues: {
      name: '',
      file: undefined,
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Please enter a name'),
      file: (value) => (value ? null : 'File is required'),
    },
  });

  const { mutate: createKbSource, isLoading } = useCreateKbSource({
    orgId,
    onSuccess: () => {
      notifyOk('Knowledge base created');
      modals.closeAll();
    },
    onError: (error) => {
      console.error(error);
      notifyError(
        error instanceof Error
          ? error.message
          : 'Error creating knowledge base',
      );
    },
  });

  function removeFile() {
    form.setFieldValue('file', undefined);
  }

  async function onSubmit() {
    const { file, name } = form.getValues();

    if (!file) {
      return;
    }

    createKbSource({ file, name });
  }

  const { file } = form.values;

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="e.g. Ops policy"
          {...form.getInputProps('name')}
        />

        {file ? (
          <Card withBorder>
            <Group justify="flex-end">
              <ActionIcon variant="transparent" onClick={removeFile}>
                <IconTrash size="1em" />
              </ActionIcon>
            </Group>
            <Stack align="center" gap="xs">
              <IconPdf />
              <Box ta="center" fz="sm">
                <Box fw="500">{file.name}</Box>
                <Box c="dimmed">{file.type.split('/')[1].toUpperCase()}</Box>
                <Box c="dimmed">{formatSize(file.size)}</Box>
              </Box>
            </Stack>
          </Card>
        ) : (
          <Dropzone
            openRef={openRef}
            onDrop={(files) => form.setFieldValue('file', files[0])}
            onReject={(fileRejections) =>
              fileRejections.forEach((rejection) =>
                notifyError(rejection.errors[0].message),
              )
            }
            className={classes.dropzone}
            radius="lg"
            maxFiles={1}
            accept={[MIME_TYPES.pdf]}
            maxSize={kbDocumentMaxSize}
            p="lg"
          >
            <div style={{ pointerEvents: 'none' }}>
              <Group justify="center">
                <Dropzone.Accept>
                  <IconDownload
                    style={{ width: rem(50), height: rem(50) }}
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    style={{ width: rem(50), height: rem(50) }}
                    color={theme.colors.red[6]}
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconCloudUpload
                    style={{ width: rem(50), height: rem(50) }}
                    stroke={1.5}
                  />
                </Dropzone.Idle>
              </Group>

              <Text ta="center" fw={700} fz="lg" mt="xl">
                <Dropzone.Accept>Drop files here</Dropzone.Accept>
                <Dropzone.Reject>
                  Pdf file less than {kbDocumentMaxSizeLabel}
                </Dropzone.Reject>
                <Dropzone.Idle>Add document</Dropzone.Idle>
              </Text>
              <Text ta="center" fz="sm" mt="xs" c="dimmed">
                Click to select or drag&apos;n&apos;drop PDF file here.
              </Text>
              <Text ta="center" fz="sm" c="dimmed">
                (Supports <i>PDF</i>. Limit {kbDocumentMaxSizeLabel}.)
              </Text>
            </div>
          </Dropzone>
        )}

        <Group justify="flex-end">
          <Button disabled={!file} type="submit">
            Next
          </Button>
        </Group>
      </Stack>

      <LoadingOverlay visible={isLoading} />
    </form>
  );
}

NewKnowledgeBaseModal.open = function openNewKnowledgeBaseModal(props: Props) {
  modals.open({
    modalId: 'new-knowledge-base-modal',
    title: 'Create Knowledge',
    children: <NewKnowledgeBaseModal {...props} />,
    size: 'lg',
    closeOnEscape: false,
    closeOnClickOutside: false,
  });
};
