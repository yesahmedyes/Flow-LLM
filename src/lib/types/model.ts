import { z } from "zod";

export const ModelZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  context_length: z.number(),
  supported_parameters: z.array(z.string()),
  architecture: z.object({
    modality: z.string(),
    input_modalities: z.array(z.string()),
    output_modalities: z.array(z.string()),
    tokenizer: z.string(),
  }),
  pricing: z.object({
    prompt: z.string(),
    completion: z.string(),
    request: z.string(),
    image: z.string(),
    web_search: z.string(),
    internal_reasoning: z.string(),
  }),
});

export type Model = z.infer<typeof ModelZodSchema>;

export const DEFAULT_MODEL = {
  id: "openai/gpt-4.1-nano",
  name: "OpenAI: GPT-4.1 Nano",
  description:
    "For tasks that demand low latency, GPT 4.1 nano is the fastest and cheapest model in the GPT-4.1 series. It delivers exceptional performance at a small size with its 1 million token context window, and scores 80.1% on MMLU, 50.3% on GPQA, and 9.8% on Aider polyglot coding - even higher than GPT-4o mini. It's ideal for tasks like classification or autocompletion.",
  context_length: 1047576,
  supported_parameters: [
    "tools",
    "tool_choice",
    "max_tokens",
    "temperature",
    "top_p",
    "stop",
    "frequency_penalty",
    "presence_penalty",
    "seed",
    "logit_bias",
    "logprobs",
    "top_logprobs",
    "response_format",
    "structured_outputs",
  ],
  architecture: {
    modality: "text+image->text",
    input_modalities: ["text", "image", "file"],
    output_modalities: ["text"],
    tokenizer: "GPT",
  },
  pricing: {
    prompt: "0.0000001",
    completion: "0.0000004",
    request: "0",
    image: "0",
    web_search: "0",
    internal_reasoning: "0",
    input_cache_read: "0.000000025",
  },
} as Model;
