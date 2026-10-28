
import "dotenv/config";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const bucket = "hic-media";
const key = `test-connection/${Date.now()}-test.txt`;
const body = "Temporary Neon Object Storage test. Safe to delete.";

const client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

let uploaded = false;

try {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "text/plain",
    })
  );
  uploaded = true;
  console.log("PASS: temporary text file uploaded.");

  await client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
  console.log("PASS: uploaded object verified.");

} catch (error) {
  console.error("TEST FAILED:", error.name, error.message);
  process.exitCode = 1;

} finally {
  if (uploaded) {
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
      console.log("CLEANUP: temporary test object deleted.");
    } catch (error) {
      console.error(
        "CLEANUP FAILED: the test object may remain at key:",
        key
      );
      console.error(error.name, error.message);
    }
  }

  client.destroy();
}
