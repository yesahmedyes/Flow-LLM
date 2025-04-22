import type { Message } from "ai";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";

export async function saveChat(data: { id: string; messages: Message[]; userId: string }) {
  await db
    .insert(chats)
    .values({
      id: data.id,
      messages: data.messages,
      name: data.messages[0]?.content ?? "New Chat",
      userId: data.userId,
    })
    .onConflictDoUpdate({
      target: chats.id,
      set: { messages: data.messages },
    })
    .returning();
}
