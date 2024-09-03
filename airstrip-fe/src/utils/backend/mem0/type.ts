export type MemoryData = {
  id: string;
  memory: string;
  user_id: string;
  hash: string;
  metadata: null;
  categories: string[];
  created_at: string; // e.g. 2024-09-03T10:16:05.490548-07:00
  updated_at: string;
  custom_categories: null;
  score: number; // 0 - 1
};

export type MemoryOptions = {
  user_id?: string;
  agent_id?: string;
  run_id?: string;
  metadata?: Record<string, unknown>;
  filters?: Record<string, unknown>;
};
