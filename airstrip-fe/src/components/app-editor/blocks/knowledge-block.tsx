import AttachKnowledgeBaseButton from '@/components/knowledge-base/attach-knowledge-base-button';
import { useAppKbSources } from '@/hooks/queries/kb-sources';
import { createReactBlockSpec } from '@blocknote/react';
import { Box, Group, Pill, Stack, Text } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import BlockExpandableContainer from './block-expandable-container';
import { customBlockTypes } from './types';

export const KnowledgeIcon = IconBook;
export const knowledgeType = customBlockTypes.knowledge;

export function createKnowledgeBlock(appId: string) {
  const Temperature = createReactBlockSpec(
    {
      type: knowledgeType,
      propSchema: {},
      content: 'none',
    },
    {
      render: (props) => {
        const { data: appKbSources } = useAppKbSources({ appId });

        return (
          <BlockExpandableContainer IconComp={KnowledgeIcon} title="Knowledge">
            <Stack>
              <Box c="dimmed" fz="sm">
                <p>
                  Upload documents for the AI assistant to use as additional
                  knowledge and reference when generating responses.
                </p>
              </Box>

              {appKbSources?.length ? (
                <Group>
                  {appKbSources.map((kbSource) => {
                    const { appId, kbSourceId, sourceData } = kbSource;
                    const key = `${appId}-${kbSourceId}`;

                    return <Pill key={key}>{sourceData.name}</Pill>;
                  })}
                </Group>
              ) : (
                <Text span c="dimmed" size="sm" fs="italic">
                  No knowledge attached to app.
                </Text>
              )}
              <AttachKnowledgeBaseButton
                appId={appId}
                disabled={!props.editor.isEditable}
              />
            </Stack>
          </BlockExpandableContainer>
        );
      },
    },
  );

  return Temperature;
}
