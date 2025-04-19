import openai from "~/server/openai/init";
import { streamText, type ChatRequest } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as ChatRequest;

    const result = streamText({
      model: openai("openai/gpt-4o-mini"),
      system: "You are a helpful assistant.",
      messages,
    });

    return result.toDataStreamResponse({
      sendSources: true,
      sendReasoning: true,
      getErrorMessage: (error) => {
        return "An unknown error occurred. Please try again later.";
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
