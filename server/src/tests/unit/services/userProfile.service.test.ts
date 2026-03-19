jest.mock("../../../app/models/schema/user.schema");
jest.mock("../../../app/utils/s3.utils");

import { UserProfileService } from "../../../app/modules/user/userProfile.service";
import { User } from "../../../app/models/schema/user.schema";
import { uploadToS3, deleteFromS3, buildAvatarKey } from "../../../app/utils/s3.utils";
import mongoose from "mongoose";

const fakeUserId = new mongoose.Types.ObjectId().toString();
const fakeKey = `avatars/users/${fakeUserId}.jpg`;
const fakeBuffer = Buffer.from("fake-image-data");

describe("UserProfileService", () => {
  let service: UserProfileService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserProfileService();
    (buildAvatarKey as jest.Mock).mockReturnValue(fakeKey);
  });

  // ─── uploadAvatar ───────────────────────────────────────────────────────────
  describe("uploadAvatar", () => {
    it("returns 404 when user not found", async () => {
      (User.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) });

      const result = await service.uploadAvatar(fakeUserId, fakeBuffer, "image/jpeg");
      expect(result.status).toBe(404);
    });

    it("deletes old avatar before uploading new one", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, avatarKey: "old/key.jpg" }),
      });
      (deleteFromS3 as jest.Mock).mockResolvedValue(undefined);
      (uploadToS3 as jest.Mock).mockResolvedValue(fakeKey);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await service.uploadAvatar(fakeUserId, fakeBuffer, "image/jpeg");
      expect(deleteFromS3).toHaveBeenCalledWith("old/key.jpg");
    });

    it("returns 200 with streaming URL on success", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, avatarKey: null }),
      });
      (uploadToS3 as jest.Mock).mockResolvedValue(fakeKey);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await service.uploadAvatar(fakeUserId, fakeBuffer, "image/jpeg");
      expect(result.status).toBe(200);
      expect((result.body as any).avatarUrl).toBe(`/api/v1/auth/avatar/${fakeUserId}`);
    });

    it("does NOT return an S3 URL — only backend streaming URL", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, avatarKey: null }),
      });
      (uploadToS3 as jest.Mock).mockResolvedValue(fakeKey);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await service.uploadAvatar(fakeUserId, fakeBuffer, "image/jpeg");
      const avatarUrl = (result.body as any).avatarUrl as string;

      expect(avatarUrl).not.toContain("amazonaws.com");
      expect(avatarUrl).not.toContain("s3.");
      expect(avatarUrl).not.toContain(fakeKey);
      expect(avatarUrl).toMatch(/^\/api\/v1\/auth\/avatar\//);
    });
  });

  // ─── getProfile ─────────────────────────────────────────────────────────────
  describe("getProfile", () => {
    it("returns 404 when user not found", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getProfile(fakeUserId);
      expect(result.status).toBe(404);
    });

    it("returns 200 with null avatarUrl when no avatar set", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, fullName: "Jane", email: "j@j.com", avatarKey: null }),
      });

      const result = await service.getProfile(fakeUserId);
      expect(result.status).toBe(200);
      expect((result.body as any).user.avatarUrl).toBeNull();
    });
  });

  // ─── updateProfile ──────────────────────────────────────────────────────────
  describe("updateProfile", () => {
    it("returns 400 when no fields provided", async () => {
      const result = await service.updateProfile(fakeUserId, {});
      expect(result.status).toBe(400);
    });

    it("returns 404 when user not found", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateProfile(fakeUserId, { fullName: "New Name" });
      expect(result.status).toBe(404);
    });

    it("returns 200 on successful update", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, fullName: "New Name", email: "j@j.com" }),
      });

      const result = await service.updateProfile(fakeUserId, { fullName: "New Name" });
      expect(result.status).toBe(200);
      expect((result.body as any).user.fullName).toBe("New Name");
    });
  });

  // ─── deleteAvatar ───────────────────────────────────────────────────────────
  describe("deleteAvatar", () => {
    it("returns 404 when user not found", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await service.deleteAvatar(fakeUserId);
      expect(result.status).toBe(404);
    });

    it("returns 404 when no avatar exists", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, avatarKey: null }),
      });

      const result = await service.deleteAvatar(fakeUserId);
      expect(result.status).toBe(404);
      expect((result.body as any).message).toMatch(/no avatar/i);
    });

    it("returns 200 and deletes from S3 + clears DB", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, avatarKey: fakeKey }),
      });
      (deleteFromS3 as jest.Mock).mockResolvedValue(undefined);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await service.deleteAvatar(fakeUserId);
      expect(result.status).toBe(200);
      expect(deleteFromS3).toHaveBeenCalledWith(fakeKey);
    });
  });
});
