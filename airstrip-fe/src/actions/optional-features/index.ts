'use server';

import {
  BLOB_STORAGE_ACCESS_KEY,
  MEM0_API_KEY,
  OPENAI_EMBEDDING_API_KEY,
} from '@/constants';
import { unstable_cache as cache } from 'next/cache';

export const checkOptionalFeatures = cache(async () => {
  return {
    memoryAllowed: !!MEM0_API_KEY,
    knowledgeBaseAllowed: !!OPENAI_EMBEDDING_API_KEY && BLOB_STORAGE_ACCESS_KEY,
  };
});
