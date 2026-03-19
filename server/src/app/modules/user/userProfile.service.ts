import { User } from "../../models/schema/user.schema";
import { IServiceResponse } from "../../types/auth.types";
import { buildAvatarKey, deleteFromS3, uploadToS3 } from "../../utils/s3.utils";
import { logger } from "../../utils/logger";

export class UserProfileService {
  // ─── Upload / replace avatar ────────────────────────────────────────────────
  // Accepts the already-resized buffer from the upload middleware.
  // Deletes the old S3 object before uploading the new one to avoid orphans.
  async uploadAvatar(
    userId: string,
    fileBuffer: Buffer,
    _mimeType: string // always jpeg after sharp — kept for clarity
  ): Promise<IServiceResponse<any>> {
    try {
      const user = await User.findById(userId).select("avatarKey").lean();
      if (!user) return { status: 404, body: { message: "User not found" } };

      // Delete previous avatar from S3 if one exists
      if ((user as any).avatarKey) {
        await deleteFromS3((user as any).avatarKey).catch((err) =>
          logger.warn("Could not delete old avatar from S3", err)
        );
      }

      const key = buildAvatarKey("users", userId, "jpg");
      await uploadToS3(key, fileBuffer, "image/jpeg");

      // Store only the S3 key — never the full URL
      await User.findByIdAndUpdate(userId, { avatarKey: key });

      return {
        status: 200,
        body: {
          message: "Avatar uploaded successfully",
          // Return a backend streaming URL — not the S3 URL
          avatarUrl: `/api/v1/auth/avatar/${userId}`,
        },
      };
    } catch (err) {
      logger.error("UserProfileService.uploadAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get full profile ───────────────────────────────────────────────────────
  async getProfile(userId: string): Promise<IServiceResponse<any>> {
    try {
      const user = await User.findById(userId)
        .select("-passwordHash -privateMetadata -avatarKey")
        .lean();

      if (!user) return { status: 404, body: { message: "User not found" } };

      return {
        status: 200,
        body: {
          message: "Profile fetched successfully",
          user: {
            ...user,
            // Expose a streaming URL, not the raw S3 key / S3 URL
            avatarUrl: (user as any).avatarKey
              ? `/api/v1/auth/avatar/${userId}`
              : null,
          },
        },
      };
    } catch (err) {
      logger.error("UserProfileService.getProfile", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update profile fields ──────────────────────────────────────────────────
  async updateProfile(
    userId: string,
    data: { fullName?: string; phone?: string }
  ): Promise<IServiceResponse<any>> {
    try {
      if (!data.fullName && !data.phone) {
        return {
          status: 400,
          body: { message: "At least one field is required to update" },
        };
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true, runValidators: true }
      )
        .select("-passwordHash -privateMetadata -avatarKey")
        .lean();

      if (!user) return { status: 404, body: { message: "User not found" } };

      return {
        status: 200,
        body: {
          message: "Profile updated successfully",
          user: {
            ...user,
            avatarUrl: (user as any).avatarKey
              ? `/api/v1/auth/avatar/${userId}`
              : null,
          },
        },
      };
    } catch (err) {
      logger.error("UserProfileService.updateProfile", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Delete avatar ──────────────────────────────────────────────────────────
  async deleteAvatar(userId: string): Promise<IServiceResponse<any>> {
    try {
      const user = await User.findById(userId).select("avatarKey").lean();
      if (!user) return { status: 404, body: { message: "User not found" } };

      if (!(user as any).avatarKey) {
        return { status: 404, body: { message: "No avatar to delete" } };
      }

      await deleteFromS3((user as any).avatarKey);
      await User.findByIdAndUpdate(userId, { $unset: { avatarKey: 1 } });

      return { status: 200, body: { message: "Avatar deleted successfully" } };
    } catch (err) {
      logger.error("UserProfileService.deleteAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
