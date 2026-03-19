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
      const user = await User.findById(userId).select("avatarKey").lean();
      if (!user) return { status: 404, body: { message: "User not found" } };

      if ((user as any).avatarKey) {
        await deleteFromS3((user as any).avatarKey).catch((err) =>
          logger.warn("Could not delete old avatar from S3", err)
        );
      }

      const key = buildAvatarKey("users", userId, "jpg");
      await uploadToS3(key, fileBuffer, "image/jpeg");
      await User.findByIdAndUpdate(userId, { avatarKey: key });

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

  // ─── Get full profile ───────────────────────────────────────────────────────
  // FIX: avatarKey has select:false so it is never in a normal query result.
  // We must do a second explicit query with .select("avatarKey") to check it.
  async getProfile(userId: string): Promise<IServiceResponse<any>> {
    try {
      const [user, avatarDoc] = await Promise.all([
        User.findById(userId)
          .select("-passwordHash -privateMetadata -avatarKey")
          .lean(),
        User.findById(userId).select("avatarKey").lean(),
      ]);

      if (!user) return { status: 404, body: { message: "User not found" } };

      return {
        status: 200,
        body: {
          message: "Profile fetched successfully",
          user: {
            ...user,
            avatarUrl: (avatarDoc as any)?.avatarKey
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

      const [user, avatarDoc] = await Promise.all([
        User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true })
          .select("-passwordHash -privateMetadata -avatarKey")
          .lean(),
        User.findById(userId).select("avatarKey").lean(),
      ]);

      if (!user) return { status: 404, body: { message: "User not found" } };

      return {
        status: 200,
        body: {
          message: "Profile updated successfully",
          user: {
            ...user,
            avatarUrl: (avatarDoc as any)?.avatarKey
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