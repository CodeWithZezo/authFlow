import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

// ─── S3 Client ────────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

// ─── Upload ───────────────────────────────────────────────────────────────────
// Returns the S3 key (stored in DB). The real S3 URL is NEVER returned to callers.
export const uploadToS3 = async (
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return key; // only the key is stored / returned
};

// ─── Stream ───────────────────────────────────────────────────────────────────
// Returns a Node Readable stream + ContentType so the controller can pipe it
// to the HTTP response. The S3 signed URL / object URL is never exposed.
export const streamFromS3 = async (
  key: string
): Promise<{ stream: Readable; contentType: string; contentLength?: number }> => {
  const response = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key })
  );

  if (!response.Body) {
    throw new Error("Empty response body from S3");
  }

  return {
    stream: response.Body as Readable,
    contentType: response.ContentType ?? "application/octet-stream",
    contentLength: response.ContentLength,
  };
};

// ─── Delete ───────────────────────────────────────────────────────────────────
export const deleteFromS3 = async (key: string): Promise<void> => {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};

// ─── Key Builder ──────────────────────────────────────────────────────────────
// Keeps S3 keys organised and predictable.
// avatars/users/<userId>.<ext>
// avatars/endusers/<userId>.<ext>
export const buildAvatarKey = (
  type: "users" | "endusers",
  userId: string,
  ext: string
): string => `avatars/${type}/${userId}.${ext}`;
