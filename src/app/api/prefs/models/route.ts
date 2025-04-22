import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redis } from "~/server/redis/init";

const getModelsKey = (userId: string) => `models:${userId}`;

async function getUserModels(userId: string) {
  const raw = await redis.get<string>(getModelsKey(userId));

  if (!raw) return null;

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

async function setUserModels(userId: string, models: string[]) {
  await redis.set(getModelsKey(userId), JSON.stringify(models));
}

export async function GET(_: Request) {
  const { userId } = await auth();

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const models = await getUserModels(userId);

  return NextResponse.json(models);
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { models } = (await req.json()) as { models: string[] };

  await setUserModels(userId, models);

  return NextResponse.json({ success: true });
}
