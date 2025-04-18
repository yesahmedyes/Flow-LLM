import OpenAI from "openai";
import { env } from "../env.js";

// Initialize OpenAI client with OpenRouter base URL and API key
export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": env.SITE_URL, // Optional, for including your app on openrouter.ai rankings
    "X-Title": "FlowGPT", // Optional, shows in rankings
  },
});

// List of available models from OpenRouter
export const availableModels = [
  { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3-opus", name: "Claude 3 Opus" },
  { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "anthropic/claude-2", name: "Claude 2" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "openai/gpt-4", name: "GPT-4" },
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B" },
  { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B" },
  { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  { id: "google/gemini-1.0-pro", name: "Gemini 1.0 Pro" },
  { id: "mistralai/mistral-large", name: "Mistral Large" },
  { id: "mistralai/mistral-medium", name: "Mistral Medium" },
  { id: "mistralai/mistral-small", name: "Mistral Small" },
];

// Types for our chat functionality
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatResponse = {
  message: Message;
  modelId: string;
};

// Function to send messages to OpenRouter
export async function chat(
  messages: Message[],
  modelId: string,
): Promise<ChatResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: modelId,
      messages,
      temperature: 0.7,
      stream: false,
    });

    const message = response.choices[0].message;

    return {
      message: {
        role: message.role as "assistant",
        content: message.content || "No response",
      },
      modelId,
    };
  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    throw error;
  }
}
