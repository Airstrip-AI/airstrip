import { AiProvider } from '@/utils/backend/client/common/types';

const openAiModels = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
];

const anthropicModels = [
  'claude-3-5-sonnet-20240620',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
];

const googleModels = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.0-pro',
  // 'aqa',
];

const mistralModels = [
  'mistral-large-latest',
  'open-mistral-nemo',
  'codestral-latest',
  'mistral-embed',
  'open-mistral-7b',
  'open-mixtral-8x7b',
  'open-mixtral-8x22b',
  'open-codestral-mamba',
];

const cohereModels = [
  'command-r-plus',
  'command-r',
  'command',
  'command-light',
];

export const models: Record<AiProvider, string[]> = {
  [AiProvider.OPENAI]: openAiModels,
  [AiProvider.ANTHROPIC]: anthropicModels,
  [AiProvider.GOOGLE]: googleModels,
  [AiProvider.MISTRAL]: mistralModels,
  [AiProvider.COHERE]: cohereModels,
  [AiProvider.OPENAI_COMPATIBLE]: [
    ...openAiModels,
    ...anthropicModels,
    ...googleModels,
    ...mistralModels,
    ...cohereModels,
  ],
};
