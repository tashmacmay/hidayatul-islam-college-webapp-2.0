
import "dotenv/config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const required = [
  "AWS_ENDPOINT_URL_S3",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error("Missing environment variables:", missing.join(", "));
  process.exit(1);
}

const client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

try {
  await client.send(
    new ListObjectsV2Command({
      Bucket: "hic-media",
      MaxKeys: 1,
    })
  );
  console.log("SUCCESS: Connected to Neon Object Storage bucket hic-media.");
} catch (error) {
  console.error("Storage test failed:", error.name, error.message);
  process.exitCode = 1;
} finally {
  client.destroy();
}
