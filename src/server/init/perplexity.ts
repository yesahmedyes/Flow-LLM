import { createPerplexity } from "@ai-sdk/perplexity";
import { env } from "~/env";

const perplexity = createPerplexity({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
});

export default perplexity;
