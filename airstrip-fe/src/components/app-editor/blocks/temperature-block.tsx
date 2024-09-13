import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { createReactBlockSpec } from '@blocknote/react';
import { Slider, Stack, Text } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconBulb } from '@tabler/icons-react';
import { useState } from 'react';
import BlockExpandableContainer from './block-expandable-container';
import { customBlockTypes } from './types';

export const TemperatureIcon = IconBulb;
export const temperatureType = customBlockTypes.temperature;

export function createTemperatureBlock(form: UseFormReturnType<UpdateAppReq>) {
  const Temperature = createReactBlockSpec(
    {
      type: temperatureType,
      propSchema: {},
      content: 'none',
    },
    {
      render: (props) => {
        const {
          value: inputPropValue,
          onChange,
          ...restInputProps
        } = form.getInputProps('temperature') || {};

        // Used to trigger re-render. Form's value change cannot trigger re-render here.
        const [internalValue, setInternalValue] =
          useState<number>(inputPropValue);

        return (
          <BlockExpandableContainer
            IconComp={TemperatureIcon}
            title="Creativity"
          >
            <Stack gap={4}>
              <Text fz="xs" c="dimmed">
                The creativity of the AI. 0 is very predictable, 1 is very
                creative.
              </Text>
              <Slider
                {...restInputProps}
                value={internalValue}
                disabled={!props.editor.isEditable}
                onChange={(value) => {
                  onChange?.(value);
                  setInternalValue(value);
                }}
                min={0}
                max={1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1, label: '1' },
                ]}
                step={0.1}
                mb="lg"
              />
            </Stack>
          </BlockExpandableContainer>
        );
      },
    },
  );

  return Temperature;
}
