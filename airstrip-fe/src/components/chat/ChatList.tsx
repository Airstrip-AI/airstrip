'use client';

import { MemoizedReactMarkdown } from '@/components/markdown';
import { Alert, Avatar, Divider, Flex } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { Message } from 'ai';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { IconUser } from '@tabler/icons-react';
import { loadImage } from '@/components/ai-providers-image/helpers';
import { AiProvider } from '@/utils/backend/client/common/types';
import AttachmentsPanel from '@/components/chat/AttachmentsPanel';

export default function ChatList({
  messages,
  aiProvider,
  error,
}: {
  aiProvider: AiProvider;
  messages: Message[];
  error: Error | undefined;
}) {
  if (!messages.length) {
    return null;
  }

  const attachmentsDisplay = (
    messageId: string,
    attachments: Message['experimental_attachments'],
  ) => {
    if (!attachments) {
      return null;
    }
    const images = attachments.filter((attachment) =>
      attachment.contentType?.startsWith('image/'),
    );
    const nonImages = attachments.filter(
      (attachment) => !attachment.contentType?.startsWith('image/'),
    );

    // display images then display the other attachments
    return (
      <>
        <Flex gap="sm" mt="md">
          {images.map((attachment, index) => (
            <div
              key={`${messageId}-${index}`}
              style={{
                width: '50px',
                height: '50px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={attachment.url}
                alt={attachment.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          ))}
        </Flex>
        <AttachmentsPanel
          files={nonImages.map((attachment) => ({
            name: attachment.name || '',
            type: attachment.contentType || '',
          }))}
        />
      </>
    );
  };

  return (
    <div>
      {messages.map((message, index) => (
        <Flex key={message.id}>
          <div style={{ paddingRight: '10px' }}>
            <Avatar
              color={message.role === 'user' ? 'blue' : undefined}
              radius="sm"
            >
              {message.role === 'user' ? <IconUser /> : loadImage(aiProvider)}
            </Avatar>
          </div>
          <div style={{ width: '95%' }}>
            <MemoizedReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              components={{
                p({ children }) {
                  return <div>{children}</div>;
                },
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return (
                    <CodeHighlight
                      language={(match && match[1]) || ''}
                      code={String(children).replace(/\n$/, '')}
                    />
                  );
                },
              }}
            >
              {message.content}
            </MemoizedReactMarkdown>
            <div>
              {attachmentsDisplay(message.id, message.experimental_attachments)}
            </div>
            {index < messages.length - 1 && <Divider my="lg" />}
          </div>
        </Flex>
      ))}
      {error && (
        <Alert color="red" variant="outline" mt="md">
          An error occurred.
        </Alert>
      )}
    </div>
  );
}
