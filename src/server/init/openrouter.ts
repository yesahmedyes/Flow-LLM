import { env } from "~/env";

import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

export default openrouter;

// const openai = createOpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: env.OPENROUTER_API_KEY,
//   compatibility: "compatible",
// });

// export default openai;
