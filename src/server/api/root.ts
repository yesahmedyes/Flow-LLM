import { chatRouter } from "~/server/api/routers/chat";
import { filesRouter } from "~/server/api/routers/files";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { modelsRouter } from "./routers/models";
import { prefsRouter } from "./routers/prefs";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chat: chatRouter,
  files: filesRouter,
  models: modelsRouter,
  prefs: prefsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
