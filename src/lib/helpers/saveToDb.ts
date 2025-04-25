import type { Message } from "ai";
import { db } from "~/server/db";
import { chats, files } from "~/server/db/schema";
import type { FileData } from "~/app/stores/filesStore";
import { and, eq, sql } from "drizzle-orm";

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

export async function saveEmbedding(data: { userId: string; embeddings: Record<string, number[]> }) {
  const updates = Object.entries(data.embeddings).map(([fileId, embeddings]) => {
    return db
      .update(files)
      .set({ embeddings: sql`vector32(${JSON.stringify(embeddings)})` })
      .where(and(eq(files.id, fileId), eq(files.userId, data.userId)));
  });

  await Promise.all(updates);
}
