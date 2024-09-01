import { MEM0_API_KEY } from '@/constants';
import { MemoryClient } from './client';

let mem0Client: MemoryClient | undefined;

try {
  mem0Client = MEM0_API_KEY ? new MemoryClient(MEM0_API_KEY) : undefined;
} catch (error) {
  console.error(error);
}

const mem0Enabled = !!mem0Client;

export { mem0Client, mem0Enabled };
