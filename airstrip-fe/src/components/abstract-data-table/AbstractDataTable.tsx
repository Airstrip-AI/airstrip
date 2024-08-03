'use client';

import { Button, Flex, rem, Text } from '@mantine/core';
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_RowData,
  useMantineReactTable,
} from 'mantine-react-table';

export type AbstractDataTableProps<T extends MRT_RowData> = {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  prevPageCursor?: string | null;
  nextPageCursor?: string | null;
  isLoading: boolean;
  loadPage?: (cursor: string) => void;
  emptyRowsMessage?: string;
  enableColumnActions?: boolean;
};

export default function AbstractDataTable<T extends MRT_RowData>({
  columns,
  data,
  prevPageCursor,
  nextPageCursor,
  isLoading,
  loadPage,
  emptyRowsMessage,
  enableColumnActions,
}: AbstractDataTableProps<T>) {
  const enableBottomToolbar = !!(prevPageCursor || nextPageCursor);

  const table = useMantineReactTable({
    columns,
    data,
    enablePagination: false,
    enableTopToolbar: false,
    enableColumnActions,
    enableBottomToolbar,
    mantineTableProps: {
      highlightOnHover: false,
      verticalSpacing: 'xs',
    },
    state: {
      showLoadingOverlay: isLoading,
    },
    renderBottomToolbar: () =>
      enableBottomToolbar ? (
        <Flex justify="center" m="md" gap="xs">
          <Button
            size="xs"
            onClick={
              prevPageCursor && loadPage
                ? () => loadPage(prevPageCursor)
                : undefined
            }
            disabled={!prevPageCursor}
          >
            &lt;
          </Button>
          <Button
            size="xs"
            onClick={
              nextPageCursor && loadPage
                ? () => loadPage(nextPageCursor)
                : undefined
            }
            disabled={!nextPageCursor}
          >
            &gt;
          </Button>
        </Flex>
      ) : undefined,
    renderEmptyRowsFallback: () => (
      <Text size="sm" c="dimmed" pl={rem(20)}>
        {emptyRowsMessage || 'No data'}
      </Text>
    ),
  });

  return <MantineReactTable table={table} />;
}
