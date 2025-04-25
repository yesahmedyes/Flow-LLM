import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import cohere from "~/server/init/cohere";
import { Buffer } from "buffer";
import { extractText, getDocumentProxy } from "unpdf";
import iconv from "iconv-lite";
import { saveEmbedding } from "~/lib/helpers/saveToDb";

const createEmbeddingSchema = z.array(
  z.object({
    fileUrl: z.string().url(),
    fileType: z.string(),
    id: z.string(),
  }),
);

export async function POST(req: Request) {
  const parsedBody = createEmbeddingSchema.safeParse(await req.json());

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsedBody.error.errors }, { status: 400 });
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = parsedBody.data;
  const results: Record<string, number[]> = {};

  // Group files by type
  const imageFiles = files.filter((file) => file.fileType.includes("image"));
  const textFiles = files.filter((file) => file.fileType.includes("text"));
  const pdfFiles = files.filter((file) => file.fileType.includes("pdf"));

  // Process image files one by one
  if (imageFiles.length > 0) {
    await Promise.all(
      imageFiles.map(async (file) => {
        const { fileUrl, id } = file;

        const image = await fetch(fileUrl);
        const buffer = await image.arrayBuffer();
        const stringifiedBuffer = Buffer.from(buffer).toString("base64");
        const contentType = image.headers.get("content-type");
        const imageBase64 = `data:${contentType};base64,${stringifiedBuffer}`;

        const embed = await cohere.v2.embed({
          model: "embed-v4.0",
          inputType: "image",
          embeddingTypes: ["float"],
          images: [imageBase64],
        });

        if (embed.embeddings.float && embed.embeddings.float.length > 0) {
          results[id] = embed.embeddings.float[0] ?? [];
        }
      }),
    );
  }

  // Process text files in batch if possible
  if (textFiles.length > 0) {
    const textContents = await Promise.all(
      textFiles.map(async (file) => {
        const { fileUrl } = file;

        const response = await fetch(fileUrl);
        const buffer = await response.arrayBuffer();
        const text = iconv.decode(Buffer.from(buffer), "utf-8");

        return { file, text };
      }),
    );

    const embed = await cohere.v2.embed({
      model: "embed-v4.0",
      inputType: "search_document",
      embeddingTypes: ["float"],
      texts: textContents.map((item) => item.text),
    });

    if (embed.embeddings.float && embed.embeddings.float.length > 0) {
      textFiles.forEach((file, index) => {
        results[file.id] = embed.embeddings.float?.[index] ?? [];
      });
    }
  }

  // Process PDF files
  if (pdfFiles.length > 0) {
    const pdfContents = await Promise.all(
      pdfFiles.map(async (file) => {
        const { fileUrl } = file;
        const response = await fetch(fileUrl);
        const buffer = await response.arrayBuffer();

        const pdf = await getDocumentProxy(new Uint8Array(buffer));
        const { text } = await extractText(pdf, { mergePages: true });

        return { file, text };
      }),
    );

    const embed = await cohere.v2.embed({
      model: "embed-v4.0",
      inputType: "search_document",
      embeddingTypes: ["float"],
      texts: pdfContents.map((item) => item.text),
    });

    if (embed.embeddings.float && embed.embeddings.float.length > 0) {
      pdfFiles.forEach((file, index) => {
        results[file.id] = embed.embeddings.float?.[index] ?? [];
      });
    }
  }

  await saveEmbedding({
    userId,
    embeddings: results,
  });

  return NextResponse.json({ success: true, results });
}
