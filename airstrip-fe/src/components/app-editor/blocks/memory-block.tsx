import { useOptionalFeatures } from '@/hooks/queries/apps';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { createReactBlockSpec } from '@blocknote/react';
import { Box, Stack, TagsInput, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconDeviceSdCard } from '@tabler/icons-react';
import { useState } from 'react';
import BlockExpandableContainer from './block-expandable-container';
import { customBlockTypes } from './types';

export const MemoryIcon = IconDeviceSdCard;
export const memoryType = customBlockTypes.memory;

export function createMemoryBlock(form: UseFormReturnType<UpdateAppReq>) {
  const { data: optionalFeatures } = useOptionalFeatures();

  const Memory = createReactBlockSpec(
    {
      type: memoryType,
      propSchema: {},
      content: 'none',
    },
    {
      render: (props) => {
        const {
          value: inputPropValue,
          onChange,
          ...restInputProps
        } = form.getInputProps('memoryQuery') || {};

        // Used to trigger re-render. Form's value change cannot trigger re-render here.
        const [value, setValue] = useState<string[]>(inputPropValue);

        return (
          <BlockExpandableContainer
            IconComp={MemoryIcon}
            title="Assistant Memory"
          >
            {!optionalFeatures?.memoryAllowed ? (
              <Text c="dimmed" fz="sm" fs="italic">
                Assistant Memory is not enabled in your project.
              </Text>
            ) : (
              <Stack>
                <Box c="dimmed" fz="sm">
                  <p>
                    With Assistant memory, user preferences and points of
                    interests can be stored and automatically used to provide
                    context across different conversations with this app.
                  </p>
                  <p>
                    This will provide users with a more personalized experience.
                  </p>
                  <Box component="p" fz="xs">
                    (Note: AI token usage will increase when Assistant memory is
                    enabled.)
                  </Box>
                </Box>

                <TagsInput
                  label="What would be relevant?"
                  value={value}
                  {...restInputProps}
                  disabled={!props.editor.isEditable}
                  onChange={(value) => {
                    onChange?.(value);
                    setValue(value);
                  }}
                  acceptValueOnBlur
                  data={[
                    'User preferences',
                    'User role',
                    'User responsibilities',
                    "User's likes",
                  ]}
                  placeholder="Use comma (,) to separate tags"
                  inputWrapperOrder={['label', 'input', 'description']}
                  description={
                    'Indicate what should be stored in the memory e.g. "user preferences". You can select from the list or type in a new tag.'
                  }
                />
              </Stack>
            )}
          </BlockExpandableContainer>
        );
      },
    },
  );

  return Memory;
}
