import { NextResponse } from "next/server";

export async function GET(_: Request) {
  try {
    const response = await fetch(`https://openrouter.ai/api/frontend/models`);

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      const data = (await response.json()) as { links: string[] };

      return NextResponse.json(data);
    } else {
      const text = await response.text();

      return new NextResponse(text);
    }
  } catch (error) {
    console.error("Failed to fetch models:", error);

    return NextResponse.json({ error: "Failed to fetch models from OpenRouter" }, { status: 500 });
  }
}
