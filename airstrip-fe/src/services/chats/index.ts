import { NotFoundException } from '@/services/errors';
import { getDb } from '@/utils/backend/drizzle';
import { eq } from 'drizzle-orm';
import { chats } from '../../utils/backend/drizzle/schema';

export async function getChatById(chatId: string) {
  const db = await getDb();

  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
  });

  if (!chat) {
    throw new NotFoundException('Chat not found');
  }

  return chat;
}
