import { createAnthropic } from '@ai-sdk/anthropic';
import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, LanguageModel, Message, streamText } from 'ai';

import { authGuard } from '@/actions/auth.guard';
import { makeAppsMemberGuard } from '@/actions/guards/apps.guard';
import { AppEntity, getAppById } from '@/services/apps';
import { getAiIntegration } from '@/utils/backend/client/ai-integrations';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { AiProvider } from '@/utils/backend/client/common/types';
import { mem0Client } from '@/utils/backend/mem0';
import { NextRequest } from 'next/server';
import { getRagContextPrompt } from './rag';

export async function POST(
  request: NextRequest,
  { params }: { params: { appId: string } },
) {
  const { appId } = params;

  const { messages } = (await request.json()) as { messages: Message[] };

  try {
    const { authToken, user } = await authGuard([makeAppsMemberGuard(appId)]);

    const app = await getAppById(appId);

    const { systemPrompt, aiProvider, aiProviderId } = app;

    if (!aiProvider) {
      throw new Error('App is disabled as no AI provider is set.');
    }

    if (!aiProviderId) {
      throw new Error('App is disabled as no AI provider API key is set.');
    }

    if (!aiProvider.aiModel) {
      throw new Error('App is disabled as no AI model is set.');
    }

    // TODO: aiProvider.aiProviderApiKey currently might be an encrypted string which needs to be decrypted to
    // the actual API key.
    // We do not use it directly yet, instead we shall use grab it from BE service first.

    const { aiProviderApiKey } = await getAiIntegration({
      aiIntegrationId: aiProvider.id,
      authToken,
    });

    const apiKey = aiProviderApiKey;

    const languageModel = getLanguageModel(
      aiProvider.aiProvider,
      aiProvider.aiModel,
      {
        apiKey,
        baseURL: aiProvider.aiProviderApiUrl || undefined,
      },
    );

    const userMessage = messages.slice().pop();

    const userPreferencesPromptAppend = await getMemoryForPrompt({
      user,
      app,
    });

    const ragPromptAppend = await getRagContextPrompt(
      appId,
      userMessage?.content || '',
    );

    const updatedSystemPrompt = `
${systemPrompt || ''}
${userPreferencesPromptAppend || ''}

${ragPromptAppend}
`.trim();

    const streamTextResp = await streamText({
      model: languageModel,
      system: updatedSystemPrompt || undefined,
      temperature: app.temperature,
      messages: convertToCoreMessages(messages as any),

      onFinish: (event) => {
        if (!userMessage) {
          return;
        }

        addToMemory({
          user,
          app,
          messages: [
            userMessage,
            { id: 'a', role: 'assistant', content: event.text },
          ],
        });
        event.text;
      },
    });

    return streamTextResp.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}

function addToMemory({
  user,
  app,
  messages,
}: {
  user: UserProfileResp;
  app: AppEntity;
  messages: Message[];
}) {
  if (!app.memory) {
    return;
  }

  try {
    const parsedMessages = messages.map(({ role, content }) => ({
      role: role === 'user' ? 'user' : 'assistant',
      content,
    }));

    return mem0Client?.add(parsedMessages, getMemoryOptions({ user, app }));
  } catch (err) {
    console.error(err);
    return;
  }
}

async function getMemoryForPrompt({
  user,
  app,
}: {
  user: UserProfileResp;
  app: AppEntity;
}) {
  if (!app.memory || !app.memoryQuery?.length) {
    return;
  }

  try {
    const queryPrompt = `Get the following data of the user:\n${app.memoryQuery.join('\n')}`;
    const memory = await mem0Client?.search(
      queryPrompt,
      getMemoryOptions({ user, app }),
    );

    const hasMemory = !!memory?.length;

    if (!hasMemory) {
      return;
    }

    return `What we currently know about the user:
  ${memory.map(({ memory: memContent }) => `- ${memContent}`).join('\n')}
  `.trim();
  } catch (err) {
    console.error(err);
    return;
  }
}

function getMemoryOptions({
  user,
  app,
}: {
  user: UserProfileResp;
  app: AppEntity;
}) {
  return { user_id: user.id, agent_id: app.id };
}

function getLanguageModel(
  aiProvider: AiProvider,
  model: string,
  genAiSettings: {
    apiKey: string;
    baseURL?: string;
  },
) {
  let languageModel: LanguageModel;
  switch (aiProvider) {
    case AiProvider.OPENAI:
    case AiProvider.OPENAI_COMPATIBLE:
      languageModel = createOpenAI({
        ...genAiSettings,
        compatibility:
          aiProvider === AiProvider.OPENAI ? 'strict' : 'compatible',
      })(model);
      break;
    case AiProvider.ANTHROPIC:
      languageModel = createAnthropic(genAiSettings)(model);
      break;
    case AiProvider.COHERE:
      languageModel = createCohere(genAiSettings)(model);
      break;
    case AiProvider.GOOGLE:
      languageModel = createGoogleGenerativeAI(genAiSettings)(model);
      break;
    case AiProvider.MISTRAL:
      languageModel = createMistral(genAiSettings)(model);
      break;
    default:
      throw new Error(`Invalid AI provider: '${aiProvider}'`);
  }

  return languageModel;
}
