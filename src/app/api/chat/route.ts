import openai from "~/server/init/openai";
import { appendResponseMessages, generateText, createDataStreamResponse, streamText, type Message, tool } from "ai";
import { saveChat } from "~/lib/utils/saveToDb";
import { auth } from "@clerk/nextjs/server";
import {
  addMemoryPrompt,
  chainOfThoughtPrompt,
  queryRewritePrompt,
  retrieveMemoryPrompt,
  systemPrompt,
  webSearchPrompt,
  webSearchQueryPrompt,
} from "./prompts";
import type { Agent } from "~/app/stores/agentStore";
import pinecone from "~/server/init/pinecone";
import cohere from "~/server/init/cohere";
import type { EmbedByTypeResponseEmbeddings } from "cohere-ai/api";
import zep from "~/server/init/zep";
import { z } from "zod";

export const maxDuration = 60;

type ChatRequest = {
  id: string;
  messages: Message[];
  model: string;
  agent?: Agent;
};

type Results = {
  rewrittenQuery: string;
  thoughtProcess: string;
  userMemories: string;
  chunks: string;
  webSearchResult: string;
};

export async function POST(req: Request) {
  try {
    const { messages, model, agent, id } = (await req.json()) as ChatRequest;

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
        // let processedMessages = [...messages];
        const userMessage = messages[messages.length - 1]!.content;
        // let enhancedContent = userMessage;

        const results: Results = {
          rewrittenQuery: "",
          thoughtProcess: "",
          userMemories: "",
          chunks: "",
          webSearchResult: "",
        };

        const annotations: { type: string; value: string }[] = [];

        if (agent?.queryRewrite) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Rewriting query..." });
          annotations.push({ type: "info", value: "Rewriting query..." });

          const rewrittenQuery = await queryRewrite(messages);
          results.rewrittenQuery = rewrittenQuery;

          dataStream.writeMessageAnnotation({ type: "query-rewrite", value: rewrittenQuery });
          annotations.push({ type: "query-rewrite", value: rewrittenQuery });
        }

        if (agent?.chainOfThought) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Thinking..." });
          annotations.push({ type: "info", value: "Thinking..." });

          const start_time = Date.now();

          const thoughtProcess = await chainOfThought(messages);
          results.thoughtProcess = thoughtProcess;

          const end_time = Date.now();

          const time_taken = (end_time - start_time) / 1000;

          dataStream.writeMessageAnnotation({ type: "info", value: `Thought for: ${time_taken.toFixed(2)} seconds` });
          annotations.push({ type: "info", value: `Thought for: ${time_taken.toFixed(2)} seconds` });

          dataStream.writeMessageAnnotation({ type: "chain-of-thought", value: thoughtProcess });
          annotations.push({ type: "chain-of-thought", value: thoughtProcess });
        }

        if (agent?.memory) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Retrieving user memories..." });
          annotations.push({ type: "info", value: "Retrieving user memories..." });

          const userMemories = await retrieveMemory(messages, userId);

          if (userMemories && userMemories.length > 0) {
            results.userMemories = userMemories;

            dataStream.writeMessageAnnotation({ type: "memory", value: userMemories });
            annotations.push({ type: "memory", value: userMemories });
          }
        }

        if (agent?.rag) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Retrieving relevant chunks..." });
          annotations.push({ type: "info", value: "Retrieving relevant chunks..." });

          const { files, chunks } = await retrieveChunks(
            results.rewrittenQuery ?? userMessage,
            userId,
            agent?.chunkReranking,
          );

          if (files > 0) {
            dataStream.writeMessageAnnotation({ type: "info", value: `Found relevant chunks from ${files} files` });
            annotations.push({ type: "info", value: `Found relevant chunks from ${files} files` });
          }

          if (chunks && chunks.length > 0) {
            results.chunks = chunks;

            dataStream.writeMessageAnnotation({ type: "rag-context", value: chunks });
            annotations.push({ type: "rag-context", value: chunks });
          }
        }

        if (agent?.webSearch) {
          dataStream.writeMessageAnnotation({ type: "info", value: "Searching the web..." });
          annotations.push({ type: "info", value: "Searching the web..." });

          const webSearchResult = await webSearch(messages);

          if (webSearchResult.length > 0) {
            results.webSearchResult = webSearchResult;

            dataStream.writeMessageAnnotation({ type: "web-search", value: webSearchResult });
            annotations.push({ type: "web-search", value: webSearchResult });
          }
        }

        const finalMessages = agent ? getFinalMessages(messages, results) : messages;

        const result = streamText({
          model: openai(model),
          system: systemPrompt,
          messages: finalMessages,
          tools: {
            addMemory: tool({
              description: addMemoryPrompt,
              parameters: z.object({
                content: z
                  .string()
                  .describe("The personal information, opinion, or context to store for personalization."),
              }),
              execute: async ({ content }) => {
                await zep.graph.add({ userId, data: content, type: "text" });

                console.log("Memory added successfully", content);

                return "Memory added successfully";
              },
            }),
          },
          maxSteps: 2,
          async onFinish({ response }) {
            const mergedMessages = appendResponseMessages({
              messages: messages as Message[],
              responseMessages: response.messages,
            });

            if (annotations.length > 0 && mergedMessages.length > 0) {
              const lastMessage = mergedMessages[mergedMessages.length - 1];

              if (lastMessage) {
                lastMessage.annotations = annotations;
              }
            }

            await saveChat({ id, messages: mergedMessages, userId });
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

const queryRewrite = async (messages: Message[]) => {
  const result = await generateText({
    model: openai("openai/gpt-4.1-nano"),
    system: queryRewritePrompt,
    messages: messages,
  });

  return result.text;
};

const chainOfThought = async (messages: Message[]) => {
  const result = await generateText({
    model: openai("openai/gpt-4.1-mini"),
    system: chainOfThoughtPrompt,
    messages: messages,
  });

  return result.text;
};

const retrieveMemory = async (messages: Message[], userId: string) => {
  const result = await generateText({
    model: openai("openai/gpt-4.1-nano"),
    system: retrieveMemoryPrompt,
    messages: messages,
  });

  const searchResult = await zep.graph.search({ userId, query: result.text });

  return searchResult.edges
    ?.map((edge) => edge.fact)
    .flat()
    .join("\n\n");
};

const retrieveChunks = async (query: string, userId: string, reranking: boolean) => {
  const response = await cohere.embed({
    model: "embed-v4.0",
    texts: [query],
    inputType: "search_query",
    embeddingTypes: ["float"],
  });

  const embedding = (response.embeddings as EmbedByTypeResponseEmbeddings).float?.[0];

  if (embedding) {
    const index = pinecone.Index("flowllm-files").namespace(userId);

    const results = await index.query({
      topK: reranking ? 10 : 5,
      vector: embedding,
      includeMetadata: true,
    });

    const uniqueFiles = new Set(results.matches?.map((match) => match.metadata?.object_name));
    const relevantChunks = results.matches?.map((match) => match.metadata?.text ?? "");

    if (reranking) {
      const response = await cohere.rerank({
        model: "rerank-v3.5",
        query: query,
        documents: relevantChunks as string[],
        topN: 5,
        returnDocuments: true,
      });

      const rerankedChunks = response.results.map((result) => result.document?.text);

      return { files: uniqueFiles.size, chunks: rerankedChunks.join("\n\n") };
    } else {
      return { files: uniqueFiles.size, chunks: relevantChunks.join("\n\n") };
    }
  }

  return { files: 0, chunks: "" };
};

const webSearch = async (messages: Message[]) => {
  const searchQuery = await generateText({
    model: openai("openai/gpt-4.1-nano"),
    system: webSearchQueryPrompt,
    messages: messages,
  });

  const result = await generateText({
    model: openai("perplexity/sonar:online"),
    system: webSearchPrompt,
    messages: [{ role: "user", content: searchQuery.text }],
  });

  return result.text;
};

const getFinalMessages = (messages: Message[], results: Results) => {
  let finalMessage = messages[messages.length - 1]!.content;

  if (results.rewrittenQuery.length > 0) {
    finalMessage += "\n\n" + "Rewritten Query: " + results.rewrittenQuery;
  }

  if (results.thoughtProcess.length > 0) {
    finalMessage += "\n\n" + "Thought Process: " + results.thoughtProcess;
  }

  if (results.userMemories.length > 0) {
    finalMessage += "\n\n" + "User Memories: " + results.userMemories;
  }

  if (results.chunks.length > 0) {
    finalMessage += "\n\n" + "Relevant Chunks: " + results.chunks;
  }

  if (results.webSearchResult.length > 0) {
    finalMessage += "\n\n" + "Web Search Result: " + results.webSearchResult;
  }

  return [...messages.slice(0, -1), { role: "user", content: finalMessage } as Message];
};
