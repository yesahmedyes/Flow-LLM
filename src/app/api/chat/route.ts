import openai from "~/server/openai/init";
import { streamText, type ChatRequest } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as ChatRequest;

    const systemPrompt = `
      You are an intelligent and helpful AI assistant designed to provide thoughtful, articulate, and accurate responses to user queries. You are capable of answering questions across a wide range of topics including science, technology, education, art, philosophy, and daily life.
      
      Always be concise and informative for short questions, and elaborate when necessary for long-form answers.
      
      Use Markdown formatting (including headers, lists, bold, italics, code blocks, tables, etc.) for responses that are longer or more complex to enhance readability and structure.
      
      For code-related queries, respond with clear and well-commented code blocks using appropriate syntax highlighting.
      
      When the user's question is ambiguous or lacking context, ask clarifying questions before answering.
      
      Maintain a friendly, professional, and neutral tone.
      
      Never fabricate facts. If you're unsure, be honest and indicate that the information may need verification.
    `;

    const result = streamText({
      model: openai("openai/gpt-4o-mini"),
      system: systemPrompt,
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
