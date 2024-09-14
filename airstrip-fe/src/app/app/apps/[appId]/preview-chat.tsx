import Chat from '@/components/chat/Chat';
import { AppEntity } from '@/services/apps';
import { Button, Drawer, Tooltip } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { IconPlayerPlayFilled } from '@tabler/icons-react';

interface Props {
  app: AppEntity;
  onClose: () => void;
  show: boolean;
}

export default function PreviewChat({ app, onClose, show }: Props) {
  return (
    <Drawer onClose={onClose} opened={show} position="right" size="xl">
      <Chat app={app} id={null} />
    </Drawer>
  );
}

PreviewChat.Button = function PreviewChatButton({
  app,
  loading,
  beforeOpen,
}: {
  app: AppEntity;
  loading: boolean;
  beforeOpen: () => Promise<void>;
}) {
  const [opened, { open, close }] = useDisclosure();
  useHotkeys([['mod+R', () => handleOpen()]]);

  async function handleOpen() {
    await beforeOpen();
    open();
  }

  return (
    <>
      <Tooltip label="⌘ + R">
        <Button
          onClick={handleOpen}
          leftSection={<IconPlayerPlayFilled size="1em" />}
          loading={loading}
        >
          Run
        </Button>
      </Tooltip>

      <PreviewChat app={app} onClose={close} show={opened} />
    </>
  );
};
