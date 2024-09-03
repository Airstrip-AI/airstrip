'use server';

import { MEM0_API_KEY } from '@/constants';
import { unstable_cache as cache } from 'next/cache';

export const checkOptionalFeatures = cache(async () => {
  return {
    memoryAllowed: !!MEM0_API_KEY,
  };
});
