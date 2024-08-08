'use client';

import { Alert, Flex, rem, Text } from '@mantine/core';

export default function AttachmentsPanel({
  files,
  onClose,
}: {
  files: {
    name: string;
    type: string;
  }[];
  /**
   * Leave this as undefined if you don't want to show the close button.
   */
  onClose?: (index: number) => void;
}) {
  return (
    <Flex mt="md" gap="sm" style={{ overflowX: 'auto' }}>
      {files.map((file, index) => (
        <Alert
          key={index}
          variant="outline"
          color="gray"
          withCloseButton={!!onClose}
          style={{ minWidth: rem(200), maxHeight: rem(80) }}
          onClose={() => onClose?.(index)}
        >
          <Text size="sm" fw="bold">
            {file.name}
          </Text>
          <Text size="xs" c="dimmed">
            {file.type}
          </Text>
        </Alert>
      ))}
    </Flex>
  );
}
