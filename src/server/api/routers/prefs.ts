import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { redis } from "~/server/init/redis";
import type { Agent } from "~/app/stores/agentStore";
import { ModelZodSchema, type Model } from "~/lib/types/model";

const getModelsKey = (userId: string) => `cache:models:${userId}`;
const themeKey = (userId: string) => `cache:theme:${userId}`;
const agentKey = (userId: string) => `cache:agent:${userId}`;

export const prefsRouter = createTRPCRouter({
  getPreferredModels: protectedProcedure.query(async ({ ctx }) => {
    const raw = await redis.get<Model[]>(getModelsKey(ctx.user.id));

    if (!raw) return [];

    return raw;
  }),

  setPreferredModels: protectedProcedure
    .input(z.object({ models: z.array(ModelZodSchema) }))
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

  getAgentPreferences: protectedProcedure.query(async ({ ctx }) => {
    const raw = await redis.get<Agent>(agentKey(ctx.user.id));

    return raw;
  }),

  setAgentPreferences: protectedProcedure
    .input(
      z.object({
        agent: z.object({
          queryRewrite: z.boolean(),
          chainOfThought: z.boolean(),
          memory: z.boolean(),
          webSearch: z.boolean(),
          rag: z.boolean(),
          chunkReranking: z.boolean(),
          critique: z.boolean(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await redis.set(agentKey(ctx.user.id), input.agent);

      return { success: true };
    }),
});
