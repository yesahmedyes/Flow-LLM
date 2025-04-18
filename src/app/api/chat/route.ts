import { NextResponse } from "next/server";
import { chat, Message } from "../../../server/openrouter";

export async function POST(request: Request) {
  try {
    const { messages, modelId } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0 || !modelId) {
      return NextResponse.json(
        { error: "Invalid request. Messages array and modelId are required." },
        { status: 400 },
      );
    }

    // Validate message format
    const validMessages = messages.every(
      (msg) =>
        msg &&
        typeof msg === "object" &&
        ["user", "assistant", "system"].includes(msg.role) &&
        typeof msg.content === "string",
    );

    if (!validMessages) {
      return NextResponse.json(
        {
          error:
            "Invalid message format. Each message must have a role and content.",
        },
        { status: 400 },
      );
    }

    const response = await chat(messages as Message[], modelId);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 },
    );
  }
}
