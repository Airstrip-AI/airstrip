'use client';

import AttachmentsPanel from '@/components/chat/AttachmentsPanel';
import { useEnterSubmit } from '@/hooks/use-enter-submit';
import { Button, FileButton, Flex, Textarea } from '@mantine/core';
import {
  IconPlayerStopFilled,
  IconSend,
  IconUpload,
} from '@tabler/icons-react';
import { ChatRequestOptions } from 'ai';
import { useRef, useState } from 'react';

export default function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: {
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  isLoading: boolean;
  stop: () => void;
}) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const [files, setFiles] = useState<File[]>([]);
  const resetRef = useRef<() => void>(null);

  const clearFiles = () => {
    setFiles([]);
    resetRef.current?.();
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e: any) => {
        e.preventDefault();

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur();
        }

        const dataTransfer = new DataTransfer();
        let fileList: FileList | undefined;
        if (files) {
          for (const file of files) {
            dataTransfer.items.add(file);
          }
          fileList = dataTransfer.files;
        }

        handleSubmit(e, {
          experimental_attachments: fileList,
        });

        clearFiles();
      }}
    >
      <div style={{ position: 'relative' }}>
        <Flex>
          <FileButton
            onChange={(incomingFiles) => {
              setFiles((files) => [...(files || []), ...incomingFiles]);
            }}
            multiple
            resetRef={resetRef}
          >
            {(props) => (
              <Button size="xs" {...props} mr="sm">
                <IconUpload />
              </Button>
            )}
          </FileButton>
          <Textarea
            w="100%"
            name="message"
            placeholder="Send a message."
            rows={2}
            minRows={2}
            autoFocus
            autosize
            autoComplete="off"
            autoCorrect="off"
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
          />
        </Flex>
        <div style={{ position: 'absolute', right: '6px', top: '10px' }}>
          {!isLoading ? (
            <Button type="submit" size="xs">
              <IconSend />
            </Button>
          ) : (
            <Button size="xs" onClick={stop}>
              <IconPlayerStopFilled />
            </Button>
          )}
        </div>
        {files?.length ? (
          <AttachmentsPanel
            files={files.map((file) => ({
              name: file.name,
              type: file.type,
            }))}
            onClose={(index) => {
              setFiles((files) => {
                const newFiles = [...(files || [])];
                newFiles.splice(index, 1);
                return newFiles;
              });
            }}
          />
        ) : null}
      </div>
    </form>
  );
}
