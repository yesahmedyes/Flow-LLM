import type { Message } from "ai";
import { db } from "~/server/db";
import { chats, files } from "~/server/db/schema";
import type { FileData } from "../types/db-types";

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
      target: [chats.id, chats.userId],
      set: { messages: data.messages },
    })
    .returning();
}

export async function saveFile(data: { fileUrl: string; fileName: string; fileType: string; userId: string }) {
  const res = await db.insert(files).values(data).returning();

  return res as FileData[];
}
