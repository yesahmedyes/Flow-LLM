import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { env } from "~/env";
import { saveFile } from "~/lib/helpers/saveToDb";

const f = createUploadthing();

const handleAuth = async () => {
  const user = await auth();

  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!user.userId) throw new UploadThingError("Unauthorized");

  return { userId: user.userId };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
    text: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata;

      const res = await saveFile({
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileType: file.type,
        userId,
      });

      const obj = {
        userId: userId,
        fileUrl: file.ufsUrl,
        fileName: file.name,
        fileType: file.type,
        id: res[0]!.id,
        createdAt: res[0]!.createdAt.toISOString(),
        updatedAt: res[0]!.updatedAt.toISOString(),
      };

      return obj;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
