import { User } from "../../models/schema/user.schema";
import { EndUser } from "../../models/schema/endUser.schema";
import { buildAvatarKey, deleteFromS3, uploadToS3 } from "../../utils/s3.utils";
import { logger } from "../../utils/logger";

export class EndUserProfileService {

  // ─── Upload / replace avatar ────────────────────────────────────────────────
  async uploadAvatar(
    userId: string,
    projectId: string,
    fileBuffer: Buffer
  ): Promise<{ status: number; body: any }> {
    try {
      const user = await User.findById(userId).select("+avatarKey").lean() as any;
      if (!user) return { status: 404, body: { message: "User not found" } };

      if (user.avatarKey) {
        await deleteFromS3(user.avatarKey).catch((err) =>
          logger.warn("Could not delete old end-user avatar", err)
        );
      }

      const key = buildAvatarKey("endusers", userId, "jpg");
      await Promise.all([
        uploadToS3(key, fileBuffer, "image/jpeg"),
      ]);
      await User.updateOne({ _id: userId }, { $set: { avatarKey: key } });

      return {
        status: 200,
        body: {
          message: "Avatar uploaded successfully",
          avatarUrl: `/api/v1/project/${projectId}/end-user/avatar/${userId}`,
        },
      };
    } catch (err) {
      logger.error("EndUserProfileService.uploadAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get profile ────────────────────────────────────────────────────────────
  // FIX: single User query with +avatarKey, parallel EndUser fetch
  async getProfile(
    userId: string,
    projectId: string
  ): Promise<{ status: number; body: any }> {
    try {
      const [user, endUser] = await Promise.all([
        User.findById(userId)
          .select("-passwordHash -privateMetadata +avatarKey")
          .lean() as Promise<any>,
        EndUser.findOne({ userId, projectId }, { role: 1, status: 1 }).lean(),
      ]);

      if (!user) return { status: 404, body: { message: "User not found" } };
      if (!endUser) return { status: 404, body: { message: "End-user record not found for this project" } };

      const { avatarKey, ...safeUser } = user;

      return {
        status: 200,
        body: {
          message: "Profile fetched successfully",
          user: {
            ...safeUser,
            role: endUser.role,
            status: endUser.status,
            avatarUrl: avatarKey
              ? `/api/v1/project/${projectId}/end-user/avatar/${userId}`
              : null,
          },
        },
      };
    } catch (err) {
      logger.error("EndUserProfileService.getProfile", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update profile ─────────────────────────────────────────────────────────
  async updateProfile(
    userId: string,
    projectId: string,
    data: { fullName?: string; phone?: string }
  ): Promise<{ status: number; body: any }> {
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
            avatarUrl: avatarKey
              ? `/api/v1/project/${projectId}/end-user/avatar/${userId}`
              : null,
          },
        },
      };
    } catch (err) {
      logger.error("EndUserProfileService.updateProfile", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Delete avatar ──────────────────────────────────────────────────────────
  async deleteAvatar(userId: string): Promise<{ status: number; body: any }> {
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
      logger.error("EndUserProfileService.deleteAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
