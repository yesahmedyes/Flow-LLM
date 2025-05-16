import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { files } from "~/server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { enqueueTask, removeTask } from "~/lib/utils/redisHelpers";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
  type _Object,
} from "@aws-sdk/client-s3";
import { env } from "~/env";
import pinecone from "~/server/init/pinecone";
import { s3Client } from "~/server/init/aws";
import { recursivelyDeleteFolder } from "~/lib/utils/s3";
import { deleteFromParentDocument } from "~/lib/utils/pinecone";

const fileSchema = z.object({
  fileUrl: z.string(),
  fileName: z.string(),
  fileType: z.string(),
});

const queueName = "files-to-process";

export const filesRouter = createTRPCRouter({
  getFileById: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { user } = ctx;

    const file = await db.query.files.findFirst({
      where: and(eq(files.id, input.id), eq(files.userId, user.id)),
    });

    if (!file) {
      throw new Error("File not found");
    }

    return file;
  }),
  fetchFiles: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).default(10),
        cursor: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const { user } = ctx;

      const filesList = await db.query.files.findMany({
        where: eq(files.userId, user.id),
        orderBy: [desc(files.createdAt)],
        limit: limit,
        offset: cursor,
      });

      const nextCursor = cursor + filesList.length;
      const hasMore = filesList.length === limit;

      return {
        items: filesList,
        nextCursor: hasMore ? nextCursor : null,
      };
    }),
  addFiles: protectedProcedure.input(z.object({ fileUrls: z.array(fileSchema) })).mutation(async ({ ctx, input }) => {
    const { user } = ctx;

    const fileUrls = input.fileUrls.map((file) => ({ ...file, userId: user.id }));

    const insertPromise = db.insert(files).values(fileUrls);

    const enqueuePromise = enqueueTask(queueName, fileUrls);

    await Promise.all([insertPromise, enqueuePromise]);

    return { success: true };
  }),
  updateFileName: protectedProcedure
    .input(z.object({ fileUrl: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      await db
        .update(files)
        .set({ fileName: input.name })
        .where(and(eq(files.fileUrl, input.fileUrl), eq(files.userId, user.id)));
    }),
  deleteFile: protectedProcedure.input(z.object({ fileUrl: z.string() })).mutation(async ({ ctx, input }) => {
    const { user } = ctx;

    const promisesToResolve = [];

    promisesToResolve.push(db.delete(files).where(and(eq(files.fileUrl, input.fileUrl), eq(files.userId, user.id))));
    promisesToResolve.push(removeTask(queueName, user.id, input.fileUrl));

    const fileUrlParts = input.fileUrl.split("/");
    const folderKey = fileUrlParts[fileUrlParts.length - 2];

    if (folderKey) {
      promisesToResolve.push(recursivelyDeleteFolder(user.id + "/" + folderKey));
      promisesToResolve.push(deleteFromParentDocument({ prefix: folderKey, userId: user.id }));
    }

    await Promise.all(promisesToResolve);
  }),
});
