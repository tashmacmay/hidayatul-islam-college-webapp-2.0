import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

const requiredEnvVars = [
  "AWS_ENDPOINT_URL_S3",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
];

function validateStorageEnv() {
  const missing = requiredEnvVars.filter(
    (name) => !process.env[name]
  );

  if (missing.length > 0) {
    throw new Error(
      `Object Storage configuration is missing: ${missing.join(", ")}`
    );
  }
}

let s3Client;

export function getS3Client() {
  validateStorageEnv();

  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  return s3Client;
}

export const STORAGE_BUCKET = "hic-media";
