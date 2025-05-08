import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "~/env";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType } = (await request.json()) as { fileName: string; fileType: string };

    const fileKey = `${userId}/${crypto.randomUUID()}-${fileName}`;

    const s3Client = new S3Client({
      region: env.AWS_REGION as string,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY as string,
        secretAccessKey: env.AWS_SECRET_KEY as string,
      },
    });

    const command = new PutObjectCommand({
      Bucket: "flowllm-bucket",
      Key: fileKey,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const fileUrl = `https://flowllm-bucket.s3.${env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return NextResponse.json({ presignedUrl, fileUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
