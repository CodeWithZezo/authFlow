// Mock S3 and sharp — no real AWS calls or image processing in tests
jest.mock("../../app/utils/s3.utils");
jest.mock("sharp");

import request from "supertest";
import { Readable } from "stream";
import app from "../../../app";
import {
  createVerifiedUser,
  createTestOrg,
  createTestProject,
  createTestPasswordPolicy,
  createTestProjectPolicy,
  createTestEndUser,
} from "../../helpers/testFactories";
import { uploadToS3, streamFromS3, deleteFromS3, buildAvatarKey } from "../../../app/utils/s3.utils";
import { User } from "../../../app/models/schema/user.schema";

const mockUploadToS3 = uploadToS3 as jest.Mock;
const mockStreamFromS3 = streamFromS3 as jest.Mock;
const mockDeleteFromS3 = deleteFromS3 as jest.Mock;
const mockBuildAvatarKey = buildAvatarKey as jest.Mock;

// Minimal 1×1 px JPEG (valid file that passes multer MIME check)
const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U" +
  "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN" +
  "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
  "MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUE/8QAIhAA" +
  "AgIBBAMBAAAAAAAAAAAAAQIDBAUREiExQf/EABUBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFBEB" +
  "AAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Aq2vaPqOq3lxZWNvJcXECB3VccA9s5q" +
  "z0PRp9Ovbu8aQR2UbRxsByw5z+qq7jrEFnaLbxQs5aPa7lsbTn096sqVoK//2Q==",
  "base64"
);

describe("Avatar Integration", () => {
  let ownerToken: string;
  let ownerUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildAvatarKey.mockReturnValue("avatars/users/test.jpg");
    mockUploadToS3.mockResolvedValue("avatars/users/test.jpg");
    mockDeleteFromS3.mockResolvedValue(undefined);
  });

  beforeEach(async () => {
    const { user, accessToken } = await createVerifiedUser();
    ownerToken = accessToken;
    ownerUserId = user._id.toString();
  });

  // ─── Internal User Avatar ───────────────────────────────────────────────────
  describe("Internal User /api/v1/auth/avatar", () => {
    it("returns 400 when no file is attached", async () => {
      const res = await request(app)
        .patch("/api/v1/auth/avatar")
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(400);
    });

    it("returns 400 for unsupported file type (text file)", async () => {
      const res = await request(app)
        .patch("/api/v1/auth/avatar")
        .set("Cookie", `accessToken=${ownerToken}`)
        .attach("avatar", Buffer.from("not an image"), {
          filename: "file.txt",
          contentType: "text/plain",
        });

      expect(res.status).toBe(400);
    });

    it("returns 200 on valid JPEG upload", async () => {
      const res = await request(app)
        .patch("/api/v1/auth/avatar")
        .set("Cookie", `accessToken=${ownerToken}`)
        .attach("avatar", TINY_JPEG, {
          filename: "avatar.jpg",
          contentType: "image/jpeg",
        });

      expect(res.status).toBe(200);
      const url = res.body.avatarUrl as string;
      expect(url).toMatch(/^\/api\/v1\/auth\/avatar\//);
      expect(url).not.toContain("amazonaws.com");
      expect(mockUploadToS3).toHaveBeenCalledTimes(1);
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .patch("/api/v1/auth/avatar")
        .attach("avatar", TINY_JPEG, { filename: "a.jpg", contentType: "image/jpeg" });

      expect(res.status).toBe(401);
    });

    it("DELETE returns 200 when avatar exists", async () => {
      // First set an avatarKey directly in DB
      await User.findByIdAndUpdate(ownerUserId, { avatarKey: "avatars/users/test.jpg" });

      const res = await request(app)
        .delete("/api/v1/auth/avatar")
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(mockDeleteFromS3).toHaveBeenCalledWith("avatars/users/test.jpg");
    });

    it("DELETE returns 404 when no avatar exists", async () => {
      const res = await request(app)
        .delete("/api/v1/auth/avatar")
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── Avatar streaming ────────────────────────────────────────────────────────
  describe("GET /api/v1/auth/avatar/:userId", () => {
    it("returns 404 when user has no avatar", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/avatar/${ownerUserId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("streams image bytes when avatar exists", async () => {
      await User.findByIdAndUpdate(ownerUserId, { avatarKey: "avatars/users/test.jpg" });

      // Mock S3 stream
      const fakeStream = new Readable({
        read() {
          this.push(TINY_JPEG);
          this.push(null);
        },
      });
      mockStreamFromS3.mockResolvedValue({
        stream: fakeStream,
        contentType: "image/jpeg",
        contentLength: TINY_JPEG.length,
      });

      const res = await request(app)
        .get(`/api/v1/auth/avatar/${ownerUserId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("image/jpeg");
      // Confirm S3 URL was never leaked into any header
      const allHeaders = JSON.stringify(res.headers);
      expect(allHeaders).not.toContain("amazonaws.com");
    });

    it("never exposes the S3 key or S3 URL in response headers or body", async () => {
      await User.findByIdAndUpdate(ownerUserId, { avatarKey: "avatars/users/secret-key.jpg" });

      const fakeStream = new Readable({ read() { this.push(TINY_JPEG); this.push(null); } });
      mockStreamFromS3.mockResolvedValue({ stream: fakeStream, contentType: "image/jpeg" });

      const res = await request(app)
        .get(`/api/v1/auth/avatar/${ownerUserId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      const allHeaders = JSON.stringify(res.headers);
      expect(allHeaders).not.toContain("secret-key.jpg");
      expect(allHeaders).not.toContain("s3.");
      expect(allHeaders).not.toContain("amazonaws");
    });
  });

  // ─── End-User Avatar ─────────────────────────────────────────────────────────
  describe("End-User Avatar", () => {
    let endUserToken: string;
    let projectId: string;
    let endUserId: string;

    beforeEach(async () => {
      const { user, accessToken } = await createVerifiedUser();
      const org = await createTestOrg(user._id.toString());
      const project = await createTestProject(org._id.toString(), user._id.toString());
      projectId = project._id.toString();
      const pp = await createTestPasswordPolicy(projectId);
      await createTestProjectPolicy(projectId, pp._id.toString());

      const eu = await createTestEndUser(projectId);
      endUserToken = eu.accessToken;
      endUserId = eu.user._id.toString();
    });

    it("PATCH /end-user/avatar returns 200 on valid upload", async () => {
      const res = await request(app)
        .patch(`/api/v1/project/${projectId}/end-user/avatar`)
        .set("Cookie", `accessToken=${endUserToken}`)
        .attach("avatar", TINY_JPEG, { filename: "avatar.jpg", contentType: "image/jpeg" });

      expect(res.status).toBe(200);
      const url = res.body.avatarUrl as string;
      expect(url).toContain(`/api/v1/project/${projectId}/end-user/avatar/`);
      expect(url).not.toContain("amazonaws.com");
    });

    it("GET /end-user/avatar/:userId streams image", async () => {
      await User.findByIdAndUpdate(endUserId, { avatarKey: "avatars/endusers/eu.jpg" });

      const fakeStream = new Readable({ read() { this.push(TINY_JPEG); this.push(null); } });
      mockStreamFromS3.mockResolvedValue({ stream: fakeStream, contentType: "image/jpeg" });

      const res = await request(app)
        .get(`/api/v1/project/${projectId}/end-user/avatar/${endUserId}`)
        .set("Cookie", `accessToken=${endUserToken}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("image/jpeg");
    });
  });
});
