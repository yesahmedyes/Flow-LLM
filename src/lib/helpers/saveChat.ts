import type { Message } from "ai";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";

export async function saveChat(data: { id: string; messages: Message[] }) {
  await db
    .insert(chats)
    .values({
      id: data.id,
      messages: data.messages,
    })
    .onConflictDoUpdate({
      target: chats.id,
      set: { messages: data.messages },
    })
    .returning();
}
