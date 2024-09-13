import { useOptionalFeatures } from '@/hooks/queries/apps';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  insertOrUpdateBlock,
} from '@blocknote/core';
import { DefaultReactSuggestionItem } from '@blocknote/react';
import { UseFormReturnType } from '@mantine/form';
import { createKnowledgeBlock, KnowledgeIcon } from './blocks/knowledge-block';
import { createMemoryBlock, MemoryIcon } from './blocks/memory-block';
import {
  createTemperatureBlock,
  TemperatureIcon,
} from './blocks/temperature-block';

const optionalConfigGroup = 'Optional Configuration';

export function useSchema({
  appId,
  form,
}: {
  appId: string;
  form: UseFormReturnType<UpdateAppReq>;
}) {
  const { data: optionalFeatures } = useOptionalFeatures();

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      temperature: createTemperatureBlock(form),
      memory: createMemoryBlock(form),
      knowledge: createKnowledgeBlock(appId),
    },
  });

  function insertTemperature(
    editor: typeof schema.BlockNoteEditor,
    addedBlockTypes: string[],
  ): DefaultReactSuggestionItem | undefined {
    const type = 'temperature';

    if (blockAlreadyAdded(type, addedBlockTypes)) {
      return;
    }

    return {
      title: 'Creativity',
      subtext: 'Adjust how creative you want the assistant to be.',
      onItemClick: () => {
        insertOrUpdateBlock(editor, {
          type,
        });
      },
      aliases: ['temperature', 'creativity'],
      group: optionalConfigGroup,
      icon: <TemperatureIcon />,
    };
  }

  function insertMemory(
    editor: typeof schema.BlockNoteEditor,
    addedBlockTypes: string[],
  ): DefaultReactSuggestionItem | undefined {
    const type = 'memory';

    if (
      blockAlreadyAdded(type, addedBlockTypes) ||
      !optionalFeatures?.memoryAllowed
    ) {
      return;
    }

    return {
      title: 'Memory',
      subtext: 'Remember user preferences mentioned in chats.',
      onItemClick: () => {
        insertOrUpdateBlock(editor, {
          type,
        });
      },
      aliases: ['memory', 'mem0'],
      group: optionalConfigGroup,
      icon: <MemoryIcon />,
    };
  }

  function insertKnowledge(
    editor: typeof schema.BlockNoteEditor,
    addedBlockTypes: string[],
  ): DefaultReactSuggestionItem | undefined {
    const type = 'knowledge';

    if (
      blockAlreadyAdded(type, addedBlockTypes) ||
      !optionalFeatures?.knowledgeBaseAllowed
    ) {
      return;
    }

    return {
      title: 'Knowledge',
      subtext: 'Attach documents and external knowledge.',
      onItemClick: () => {
        insertOrUpdateBlock(editor, {
          type,
        });
      },
      aliases: ['knowledge', 'documents', 'embeddings', 'rag', 'vector'],
      group: optionalConfigGroup,
      icon: <KnowledgeIcon />,
    };
  }

  function insertBlocks(
    editor: typeof schema.BlockNoteEditor,
    addedBlockTypes: string[],
  ) {
    return [
      insertTemperature(editor, addedBlockTypes),
      insertMemory(editor, addedBlockTypes),
      insertKnowledge(editor, addedBlockTypes),
    ];
  }

  return { schema, insertBlocks };
}

function blockAlreadyAdded(type: string, addedBlockTypes: string[]) {
  return addedBlockTypes.includes(type);
}
