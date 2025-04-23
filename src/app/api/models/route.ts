import { NextResponse } from "next/server";
import type { Model } from "~/lib/types/model";

export async function GET(_: Request) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      const data = (await response.json()) as { data: Model[] };

      return NextResponse.json(data.data);
    }
  } catch (error) {
    console.error("Failed to fetch models:", error);

    return NextResponse.json({ error: "Failed to fetch models from OpenRouter" }, { status: 500 });
  }
}
