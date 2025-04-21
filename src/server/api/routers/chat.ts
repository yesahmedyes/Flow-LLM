import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type Message } from "ai";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const chatRouter = createTRPCRouter({
  getChatById: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, input.id),
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    return chat;
  }),
  fetchInitialChats: publicProcedure.query(async () => {
    const chatsList = await db.query.chats.findMany({
      orderBy: [desc(chats.updatedAt)],
      limit: 5,
      offset: 0,
    });

    const nextCursor = 5;
    const hasMore = chatsList.length === 5;

    return {
      items: chatsList,
      nextCursor: hasMore ? nextCursor : null,
    };
  }),
  fetchMoreChats: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).default(10),
        cursor: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const { limit, cursor } = input;

      const chatsList = await db.query.chats.findMany({
        orderBy: [desc(chats.updatedAt)],
        limit: limit,
        offset: cursor,
      });

      const nextCursor = cursor + chatsList.length;
      const hasMore = chatsList.length === limit;

      return {
        items: chatsList,
        nextCursor: hasMore ? nextCursor : null,
      };
    }),
  upsertChat: publicProcedure
    .input(z.object({ id: z.string(), messages: z.array(z.custom<Message>()) }))
    .mutation(async ({ input }) => {
      return db
        .insert(chats)
        .values({
          id: input.id,
          messages: input.messages,
        })
        .onConflictDoUpdate({
          target: chats.id,
          set: { messages: input.messages },
        });
    }),
  deleteChat: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    await db.delete(chats).where(eq(chats.id, input.id));
  }),
});
