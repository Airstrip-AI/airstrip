import {
  createKbSource,
  getDocUploadPresignedUrl,
  listAppKbSources,
  listKbSources,
  saveAppKbSources,
} from '@/actions/knowledge-base';
import { QueryKeys } from '@/hooks/helpers';
import type { FileWithPath } from '@mantine/dropzone';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export function useCreateKbSource({
  orgId,
  onSuccess,
  onError,
}: {
  orgId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      name,
    }: {
      file: FileWithPath;
      name: string;
    }) => {
      const { signedUrl, blobKey } = await getDocUploadPresignedUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await createKbSource({
        orgId,
        blobKey,
        name,
        contentType: file.type,
        size: file.size,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.KNOWLEDGE_BASE_SOURCES, orgId]);
      onSuccess();
    },
    onError,
  });
}

export function useKbSources({
  orgId,
  onError,
}: {
  orgId?: string;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.KNOWLEDGE_BASE_SOURCES, orgId],
    queryFn: () => {
      if (!orgId) {
        return [];
      }

      return listKbSources(orgId);
    },
    onError,
    enabled: !!orgId,
  });
}

export function useAppKbSources({
  appId,
  onError,
}: {
  appId: string;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: [QueryKeys.APP_KNOWLEDGE_BASE_SOURCES, appId],
    queryFn: () => {
      return listAppKbSources(appId);
    },
    onError,
  });
}

export function useUpdateAppKbSources({
  appId,
  onSuccess,
  onError,
}: {
  appId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceIds }: { sourceIds: string[] }) => {
      await saveAppKbSources({
        appId,
        sourceIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        QueryKeys.APP_KNOWLEDGE_BASE_SOURCES,
        appId,
      ]);
      onSuccess();
    },
    onError,
  });
}
