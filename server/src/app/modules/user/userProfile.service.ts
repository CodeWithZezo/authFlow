import { User } from "../../models/schema/user.schema";
import { IServiceResponse } from "../../types/auth.types";
import { buildAvatarKey, deleteFromS3, uploadToS3 } from "../../utils/s3.utils";
import { logger } from "../../utils/logger";

export class UserProfileService {

  // ─── Upload / replace avatar ────────────────────────────────────────────────
  async uploadAvatar(
    userId: string,
    fileBuffer: Buffer,
    _mimeType: string
  ): Promise<IServiceResponse<any>> {
    try {
      // Single query with explicit avatarKey fetch
      const user = await User.findById(userId).select("+avatarKey").lean() as any;
      if (!user) return { status: 404, body: { message: "User not found" } };

      if (user.avatarKey) {
        await deleteFromS3(user.avatarKey).catch((err) =>
          logger.warn("Could not delete old avatar from S3", err)
        );
      }

      const key = buildAvatarKey("users", userId, "jpg");
      await uploadToS3(key, fileBuffer, "image/jpeg");
      await User.updateOne({ _id: userId }, { $set: { avatarKey: key } });

      return {
        status: 200,
        body: {
          message: "Avatar uploaded successfully",
          avatarUrl: `/api/v1/auth/avatar/${userId}`,
        },
      };
    } catch (err) {
      logger.error("UserProfileService.uploadAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get profile ────────────────────────────────────────────────────────────
  // FIX: single query — select +avatarKey, strip it before returning
  async getProfile(userId: string): Promise<IServiceResponse<any>> {
    try {
      const user = await User.findById(userId)
        .select("-passwordHash -privateMetadata +avatarKey")
        .lean() as any;

      if (!user) return { status: 404, body: { message: "User not found" } };

      const { avatarKey, ...safeUser } = user;

      return {
        status: 200,
        body: {
          message: "Profile fetched successfully",
          user: {
            ...safeUser,
            avatarUrl: avatarKey ? `/api/v1/auth/avatar/${userId}` : null,
          },
        },
      };
    } catch (err) {
      logger.error("UserProfileService.getProfile", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update profile ─────────────────────────────────────────────────────────
  // FIX: single query — findByIdAndUpdate returns updated doc with +avatarKey
  async updateProfile(
    userId: string,
    data: { fullName?: string; phone?: string }
  ): Promise<IServiceResponse<any>> {
    try {
      if (!data.fullName && !data.phone) {
        return { status: 400, body: { message: "At least one field is required to update" } };
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true, runValidators: true }
      )
        .select("-passwordHash -privateMetadata +avatarKey")
        .lean() as any;

      if (!user) return { status: 404, body: { message: "User not found" } };

      const { avatarKey, ...safeUser } = user;

      return {
        status: 200,
        body: {
          message: "Profile updated successfully",
          user: {
            ...safeUser,
            avatarUrl: avatarKey ? `/api/v1/auth/avatar/${userId}` : null,
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
      const user = await User.findById(userId).select("+avatarKey").lean() as any;
      if (!user) return { status: 404, body: { message: "User not found" } };
      if (!user.avatarKey) return { status: 404, body: { message: "No avatar to delete" } };

      await Promise.all([
        deleteFromS3(user.avatarKey),
        User.updateOne({ _id: userId }, { $unset: { avatarKey: 1 } }),
      ]);

      return { status: 200, body: { message: "Avatar deleted successfully" } };
    } catch (err) {
      logger.error("UserProfileService.deleteAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
