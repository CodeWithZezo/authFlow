// All AWS SDK calls are mocked — no real S3 traffic
jest.mock("@aws-sdk/client-s3", () => {
  const mockSend = jest.fn();
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    __mockSend: mockSend,
  };
});

import { Readable } from "stream";

// Import AFTER mocking so the module picks up the mocked S3Client
const s3Module = require("../../../app/utils/s3.utils");
const { uploadToS3, streamFromS3, deleteFromS3, buildAvatarKey } = s3Module;
const { __mockSend } = require("@aws-sdk/client-s3") as any;

beforeEach(() => {
  __mockSend.mockReset();
});

describe("s3.utils", () => {
  describe("buildAvatarKey", () => {
    it("builds a users key correctly", () => {
      const key = buildAvatarKey("users", "abc123", "jpg");
      expect(key).toBe("avatars/users/abc123.jpg");
    });

    it("builds an endusers key correctly", () => {
      const key = buildAvatarKey("endusers", "xyz789", "jpg");
      expect(key).toBe("avatars/endusers/xyz789.jpg");
    });
  });

  describe("uploadToS3", () => {
    it("calls S3 send and returns the key", async () => {
      __mockSend.mockResolvedValueOnce({});
      const key = await uploadToS3("avatars/users/u1.jpg", Buffer.from("data"), "image/jpeg");
      expect(__mockSend).toHaveBeenCalledTimes(1);
      expect(key).toBe("avatars/users/u1.jpg");
    });

    it("propagates S3 errors", async () => {
      __mockSend.mockRejectedValueOnce(new Error("S3 PutObject failed"));
      await expect(uploadToS3("key", Buffer.from("x"), "image/jpeg")).rejects.toThrow("S3 PutObject failed");
    });
  });

  describe("streamFromS3", () => {
    it("returns stream and contentType on success", async () => {
      const fakeStream = new Readable({ read() { this.push(null); } });
      __mockSend.mockResolvedValueOnce({
        Body: fakeStream,
        ContentType: "image/jpeg",
        ContentLength: 1024,
      });

      const result = await streamFromS3("avatars/users/u1.jpg");
      expect(result.stream).toBe(fakeStream);
      expect(result.contentType).toBe("image/jpeg");
      expect(result.contentLength).toBe(1024);
    });

    it("throws if Body is missing", async () => {
      __mockSend.mockResolvedValueOnce({ Body: null });
      await expect(streamFromS3("some/key")).rejects.toThrow("Empty response body from S3");
    });

    it("defaults contentType to application/octet-stream when missing", async () => {
      const fakeStream = new Readable({ read() { this.push(null); } });
      __mockSend.mockResolvedValueOnce({ Body: fakeStream });
      const result = await streamFromS3("some/key");
      expect(result.contentType).toBe("application/octet-stream");
    });
  });

  describe("deleteFromS3", () => {
    it("calls S3 send once", async () => {
      __mockSend.mockResolvedValueOnce({});
      await deleteFromS3("avatars/users/u1.jpg");
      expect(__mockSend).toHaveBeenCalledTimes(1);
    });

    it("propagates S3 errors", async () => {
      __mockSend.mockRejectedValueOnce(new Error("Delete failed"));
      await expect(deleteFromS3("key")).rejects.toThrow("Delete failed");
    });
  });
});
