import { env } from "~/env";

import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: env.AWS_REST_REGION as string,
  credentials: {
    accessKeyId: env.AWS_REST_ACCESS_KEY as string,
    secretAccessKey: env.AWS_REST_SECRET_KEY as string,
  },
});

export const getFileUrl = (fileKey: string) => {
  return `https://flowllm-bucket.s3.${env.AWS_REST_REGION}.amazonaws.com/${fileKey}`;
};
