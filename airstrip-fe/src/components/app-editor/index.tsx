import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from '@blocknote/react';
import { UseFormReturnType } from '@mantine/form';
import { useEffect, useMemo, useState } from 'react';
import { customBlockTypes, GenericBlock } from './blocks/types';
import { useSchema } from './schema';

interface Props {
  appId: string;
  form: UseFormReturnType<UpdateAppReq>;
  disabled?: boolean;
}

// Used for parsing md/string to blocks.
const dummyEditor = BlockNoteEditor.create();

export const customBlockTypeSet = new Set(Object.values(customBlockTypes));

// Notion-block style editor for app prompts and optional configurations.
export default function AppEditor({ appId, form, disabled }: Props) {
  const [initialContent, setInitialContent] = useState<GenericBlock[]>();

  const { schema, insertBlocks } = useSchema({
    appId,
    form,
  });

  const editor = useMemo(() => {
    if (!initialContent) return undefined;

    return BlockNoteEditor.create({ schema, initialContent });
  }, [initialContent]);

  useEffect(() => {
    const { systemPrompt: initialPrompt, systemPromptJson: initialPromptJson } =
      form.getValues();

    if (initialPromptJson) {
      setInitialContent(initialPromptJson);
      return;
    }

    // Migrate plaintext system prompt made in older editor if it exists.
    // Otherwise make an empty paragraph.
    dummyEditor
      .tryParseMarkdownToBlocks(initialPrompt || '')
      .then((initialBlocks) => {
        setInitialContent(initialBlocks);
      });

    return;
  }, []);

  function getCustomSlashMenuItems(
    editor: typeof schema.BlockNoteEditor,
  ): DefaultReactSuggestionItem[] {
    const defaultItems = getDefaultReactSlashMenuItems(editor);

    const addedBlockTypes = editor.document.map((block) => block.type);

    const filteredDefaultItems = [
      ...defaultItems,
      ...insertBlocks(editor, addedBlockTypes),
    ].filter((item): item is DefaultReactSuggestionItem => {
      return !!item && item.group?.toLowerCase() !== 'media';
    });

    return filteredDefaultItems;
  }

  return editor ? (
    <BlockNoteView
      editor={editor}
      theme="light"
      slashMenu={false}
      style={{ minHeight: '30vh' }}
      editable={!disabled}
      onChange={() => {
        form.setFieldValue('systemPromptJson', editor.document);

        const filteredDoc = editor.document.filter((block) => {
          return !customBlockTypeSet.has(block.type);
        });

        editor.blocksToMarkdownLossy(filteredDoc).then((md) => {
          form.setFieldValue('systemPrompt', md.trim());
        });
      }}
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(getCustomSlashMenuItems(editor), query)
        }
      />
    </BlockNoteView>
  ) : null;
}
