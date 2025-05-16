import { DeleteObjectsCommand, ListObjectsV2Command, type _Object } from "@aws-sdk/client-s3";
import { s3Client } from "~/server/init/aws";

export const recursivelyDeleteFolder = async (prefix: string) => {
  let isTruncated = true;

  while (isTruncated) {
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: "flowllm-bucket",
        Prefix: prefix,
      }),
    );

    if (listedObjects.Contents) {
      const deleteParams = {
        Bucket: "flowllm-bucket",
        Delete: {
          Objects: listedObjects.Contents.map((item: _Object) => ({ Key: item.Key! })),
          Quiet: true,
        },
      };

      await s3Client.send(new DeleteObjectsCommand(deleteParams));
    }

    isTruncated = listedObjects.IsTruncated ?? false;
  }
};
