import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getFileUrl, s3Client } from "~/server/init/aws";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType } = (await request.json()) as { fileName: string; fileType: string };

    const fileKey = `temp/${userId}/${crypto.randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: "flowllm-bucket",
      Key: fileKey,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const fileUrl = getFileUrl(fileKey);

    return NextResponse.json({ presignedUrl, fileUrl });
  } catch (error) {
    console.error("Error generating presigned URL for temporary file:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
