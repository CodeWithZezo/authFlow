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
      const user = await User.findById(userId).select("avatarKey").lean();
      if (!user) return { status: 404, body: { message: "User not found" } };

      // Delete old avatar from S3 if one exists
      if ((user as any).avatarKey) {
        await deleteFromS3((user as any).avatarKey).catch((err) =>
          logger.warn("Could not delete old end-user avatar", err)
        );
      }

      const key = buildAvatarKey("endusers", userId, "jpg");
      await uploadToS3(key, fileBuffer, "image/jpeg");

      await User.findByIdAndUpdate(userId, { avatarKey: key });

      return {
        status: 200,
        body: {
          message: "Avatar uploaded successfully",
          // Streaming URL scoped to the project endpoint — no S3 URL exposed
          avatarUrl: `/api/v1/project/${projectId}/end-user/avatar/${userId}`,
        },
      };
    } catch (err) {
      logger.error("EndUserProfileService.uploadAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get profile ────────────────────────────────────────────────────────────
  async getProfile(
    userId: string,
    projectId: string
  ): Promise<{ status: number; body: any }> {
    try {
      const user = await User.findById(userId)
        .select("-passwordHash -privateMetadata -avatarKey")
        .lean();

      if (!user) return { status: 404, body: { message: "User not found" } };

      // Fetch end-user specific data (role, status inside the project)
      const endUser = await EndUser.findOne({ userId, projectId }).lean();
      if (!endUser) {
        return {
          status: 404,
          body: { message: "End-user record not found for this project" },
        };
      }

      // Re-fetch avatarKey separately so it's never part of the response
      const avatarDoc = await User.findById(userId).select("avatarKey").lean();

      return {
        status: 200,
        body: {
          message: "Profile fetched successfully",
          user: {
            ...user,
            role: endUser.role,
            status: endUser.status,
            avatarUrl: (avatarDoc as any)?.avatarKey
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

      const avatarDoc = await User.findById(userId).select("avatarKey").lean();

      return {
        status: 200,
        body: {
          message: "Profile updated successfully",
          user: {
            ...user,
            avatarUrl: (avatarDoc as any)?.avatarKey
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
      const user = await User.findById(userId).select("avatarKey").lean();
      if (!user) return { status: 404, body: { message: "User not found" } };

      if (!(user as any).avatarKey) {
        return { status: 404, body: { message: "No avatar to delete" } };
      }

      await deleteFromS3((user as any).avatarKey);
      await User.findByIdAndUpdate(userId, { $unset: { avatarKey: 1 } });

      return { status: 200, body: { message: "Avatar deleted successfully" } };
    } catch (err) {
      logger.error("EndUserProfileService.deleteAvatar", err);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
