import { env } from "~/env";

import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  compatibility: "compatible",
});

export default openai;
