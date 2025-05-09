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
  id: "openai/gpt-4o-mini",
  name: "OpenAI: GPT-4o-mini",
  description:
    "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
  context_length: 128000,
  supported_parameters: [
    "max_tokens",
    "temperature",
    "top_p",
    "stop",
    "frequency_penalty",
    "presence_penalty",
    "web_search_options",
    "seed",
    "logit_bias",
    "logprobs",
    "top_logprobs",
    "response_format",
    "structured_outputs",
    "tools",
    "tool_choice",
  ],
  architecture: {
    modality: "text+image->text",
    input_modalities: ["text", "image", "file"],
    output_modalities: ["text"],
    tokenizer: "GPT",
  },
  pricing: {
    prompt: "0.00000015",
    completion: "0.0000006",
    request: "0",
    image: "0.000217",
    web_search: "0",
    internal_reasoning: "0",
  },
} as Model;
