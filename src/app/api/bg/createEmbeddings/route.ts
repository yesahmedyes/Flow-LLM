import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type createEmbeddingProps = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export async function POST(req: Request) {
  const { fileUrl, fileName, fileType, id, createdAt, updatedAt } = (await req.json()) as createEmbeddingProps;

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(userId, fileUrl, fileName, fileType, id, createdAt, updatedAt);

  return NextResponse.json({ success: true });
}
