import openai from "~/server/init/openai";
import { appendResponseMessages, streamText, type Message } from "ai";
import { saveChat } from "~/lib/helpers/saveToDb";
import { auth } from "@clerk/nextjs/server";
import { createDataStreamResponse } from "ai";

export const maxDuration = 60;

type ChatRequest = {
  id: string;
  messages: Message[];
  model: string;
  searchFromFiles?: boolean;
};

export async function POST(req: Request) {
  try {
    const { messages, id, model, searchFromFiles = false } = (await req.json()) as ChatRequest;

    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `
      You are an intelligent and helpful AI assistant designed to provide thoughtful, articulate, and accurate responses to user queries. You are capable of answering questions across a wide range of topics including science, technology, education, art, philosophy, and daily life.

      Always be concise and informative for short questions, and elaborate when necessary for long-form answers.

      Use Markdown formatting (including headers, lists, bold, italics, code blocks, tables, etc.) for responses that are longer or more complex to enhance readability and structure.

      For code-related queries, respond with clear and well-commented code blocks using appropriate syntax highlighting.

      When the user's question is ambiguous or lacking context, ask clarifying questions before answering.

      Maintain a friendly, professional, and neutral tone.

      Never fabricate facts. If you're unsure, be honest and indicate that the information may need verification.
    `;

    console.log("model", model);

    const result = streamText({
      model: openai(model),
      system: systemPrompt,
      messages,
      async onFinish({ response }) {
        await saveChat({
          id,
          messages: appendResponseMessages({
            messages: messages as Message[],
            responseMessages: response.messages,
          }),
          userId,
        });
      },
    });

    return createDataStreamResponse({
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
      async execute(dataStream) {
        if (searchFromFiles) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Searching from files..." });
        }

        result.mergeIntoDataStream(dataStream, {
          sendSources: true,
          sendReasoning: true,
        });
      },
      onError: (_) => "An unknown error occurred. Please try again later.",
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
