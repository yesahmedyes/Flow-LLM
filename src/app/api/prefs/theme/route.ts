import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redis } from "~/server/redis/init";

const themeKey = (userId: string) => `theme:${userId}`;

export async function setUserTheme(userId: string, theme: string) {
  await redis.set(themeKey(userId), theme);
}

export async function getUserTheme(userId: string) {
  const raw = await redis.get<string>(themeKey(userId));

  if (!raw) return null;

  return raw;
}

export async function GET(_: Request) {
  const { userId } = await auth();

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const theme = await getUserTheme(userId);

  return NextResponse.json(theme);
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { theme } = (await req.json()) as { theme: string };

  await setUserTheme(userId, theme);

  return NextResponse.json({ success: true });
}
