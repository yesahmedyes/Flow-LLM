import { createTRPCRouter, publicProcedure } from "../trpc";
import type { Model } from "~/lib/types/model";

export const modelsRouter = createTRPCRouter({
  getModels: publicProcedure.query(async () => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models");
      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        const data = (await response.json()) as { data: Model[] };
        return data.data;
      }

      throw new Error("Invalid response format from OpenRouter");
    } catch (error) {
      console.error("Failed to fetch models:", error);
      throw new Error("Failed to fetch models from OpenRouter");
    }
  }),
});
