import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type Message } from "ai";
import { db } from "~/server/db";
import { chats } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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
});
