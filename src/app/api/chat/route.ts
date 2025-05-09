import openai from "~/server/init/openai";
import { appendResponseMessages, generateText, createDataStreamResponse, streamText, type Message } from "ai";
import { saveChat } from "~/lib/helpers/saveToDb";
import { auth } from "@clerk/nextjs/server";
import { chainOfThoughtPrompt, queryRewritePrompt, systemPrompt } from "./prompts";
import type { Agent } from "~/app/stores/agentStore";
import pinecone from "~/server/init/pinecone";
import cohere from "~/server/init/cohere";
import type { EmbedByTypeResponseEmbeddings } from "cohere-ai/api";

export const maxDuration = 60;

type ChatRequest = {
  id: string;
  messages: Message[];
  model: string;
  agent?: Agent;
};

export async function POST(req: Request) {
  try {
    const { messages, id, model, agent } = (await req.json()) as ChatRequest;

    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return createDataStreamResponse({
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
      async execute(dataStream) {
        let processedMessages = [...messages];

        const userMessage = messages[messages.length - 1]!.content;

        let enhancedContent = userMessage;

        if (agent?.queryRewrite) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Rewriting query..." });

          const result = await generateText({
            model: openai("openai/gpt-4.1-nano"),
            system: queryRewritePrompt,
            messages: [{ role: "user", content: userMessage }],
          });

          dataStream.writeMessageAnnotation({ type: "query-rewrite", value: result.text });

          enhancedContent = result.text;
        }

        if (agent?.chainOfThought) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Thinking..." });

          const start_time = Date.now();

          const result = await generateText({
            model: openai("openai/gpt-4.1-mini"),
            system: chainOfThoughtPrompt,
            messages: [{ role: "user", content: userMessage }],
          });

          const end_time = Date.now();

          const time_taken = end_time - start_time;

          dataStream.writeMessageAnnotation({
            type: "info",
            value: `Thought for: ${(time_taken / 1000).toFixed(2)} seconds`,
          });

          dataStream.writeMessageAnnotation({ type: "chain-of-thought", value: result.text });

          enhancedContent = `${enhancedContent}\n\n Here's my thought process that you can use to answer the question: ${result.text}`;
        }

        if (agent?.rag) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Retrieving relevant chunks..." });

          const response = await cohere.embed({
            model: "embed-v4.0",
            texts: [enhancedContent],
            inputType: "search_query",
            embeddingTypes: ["float"],
          });

          const embedding = (response.embeddings as EmbedByTypeResponseEmbeddings).float?.[0];

          if (embedding) {
            const index = pinecone.Index("flowllm-files").namespace(userId);

            const results = await index.query({
              topK: agent?.chunkReranking ? 10 : 5,
              vector: embedding,
              includeMetadata: true,
            });

            const uniqueFiles = new Set(results.matches?.map((match) => match.metadata?.object_name));
            const relevantChunks = results.matches?.map((match) => match.metadata?.text ?? "");

            if (uniqueFiles.size > 0) {
              dataStream.writeMessageAnnotation({
                type: "info",
                value: `Found relevant chunks from ${uniqueFiles.size} files`,
              });
            }

            if (agent?.chunkReranking) {
              dataStream.writeMessageAnnotation({ type: "info", value: "Reranking chunks..." });

              const response = await cohere.rerank({
                model: "rerank-v3.5",
                query: enhancedContent,
                documents: relevantChunks as string[],
                topN: 5,
                returnDocuments: true,
              });

              const rerankedChunks = response.results.map((result) => result.document?.text);

              if (rerankedChunks && rerankedChunks.length > 0) {
                const contextString = rerankedChunks.join("\n\n");

                dataStream.writeMessageAnnotation({ type: "rag-context", value: contextString });

                enhancedContent = `${enhancedContent}\n\n Here's some relevant context that you can use to answer the question: ${contextString}`;
              }
            } else if (relevantChunks && relevantChunks.length > 0) {
              const contextString = relevantChunks.join("\n\n");

              dataStream.writeMessageAnnotation({ type: "rag-context", value: contextString });

              enhancedContent = `${enhancedContent}\n\n Here's some relevant context that you can use to answer the question: ${contextString}`;
            }
          }
        }

        if (enhancedContent !== userMessage) {
          processedMessages = processedMessages.slice(0, -1);

          processedMessages.push({ role: "user", content: enhancedContent, id: messages[messages.length - 1]!.id });
        }

        const result = streamText({
          model: openai(model),
          system: systemPrompt,
          messages: processedMessages,
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
