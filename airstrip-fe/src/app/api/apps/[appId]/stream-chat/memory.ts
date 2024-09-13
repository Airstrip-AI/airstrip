import { AppEntity } from '@/services/apps';
import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { mem0Client } from '@/utils/backend/mem0';
import { Message } from 'ai';

export function addToMemory({
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

export async function getMemoryForPrompt({
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
