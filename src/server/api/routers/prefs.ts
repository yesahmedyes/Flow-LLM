import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { redis } from "~/server/init/redis";

const getModelsKey = (userId: string) => `cache:models:${userId}`;
const themeKey = (userId: string) => `cache:theme:${userId}`;

export const prefsRouter = createTRPCRouter({
  getPreferredModels: protectedProcedure.query(async ({ ctx }) => {
    const raw = await redis.get<string[]>(getModelsKey(ctx.user.id));

    if (!raw) return ["gpt-4o-mini"];

    return raw;
  }),

  setPreferredModels: protectedProcedure
    .input(z.object({ models: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await redis.set(getModelsKey(ctx.user.id), input.models);

      return { success: true };
    }),

  getTheme: protectedProcedure.query(async ({ ctx }) => {
    const raw = await redis.get<string>(themeKey(ctx.user.id));

    return raw;
  }),

  setTheme: protectedProcedure.input(z.object({ theme: z.string() })).mutation(async ({ ctx, input }) => {
    await redis.set(themeKey(ctx.user.id), input.theme);

    return { success: true };
  }),
});
