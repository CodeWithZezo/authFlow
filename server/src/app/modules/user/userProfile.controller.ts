import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { UserProfileService } from "./userProfile.service";
import { User } from "../../models/schema/user.schema";
import { streamFromS3 } from "../../utils/s3.utils";
import { logger } from "../../utils/logger";

export class UserProfileController {
  private profileService: UserProfileService;

  constructor(profileService?: UserProfileService) {
    this.profileService = profileService ?? new UserProfileService();
  }

  // ─── GET /auth/profile ───────────────────────────────────────────────────────
  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.profileService.getProfile(
        req.user!.userId
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── PATCH /auth/profile ─────────────────────────────────────────────────────
  updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      const { fullName, phone } = req.body;
      const { status, body } = await this.profileService.updateProfile(
        req.user!.userId,
        { fullName, phone }
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── PATCH /auth/avatar ──────────────────────────────────────────────────────
  // Receives file from avatarUpload middleware (already resized by sharp).
  uploadAvatar = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No image file provided. Use field name 'avatar'." });
      }

      const { status, body } = await this.profileService.uploadAvatar(
        req.user!.userId,
        req.file.buffer,
        req.file.mimetype
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── DELETE /auth/avatar ─────────────────────────────────────────────────────
  deleteAvatar = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.profileService.deleteAvatar(
        req.user!.userId
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── GET /auth/avatar/:userId ────────────────────────────────────────────────
  // Streams the avatar directly from S3 to the client.
  // The S3 object URL is NEVER exposed — this endpoint IS the URL the frontend uses.
  streamAvatar = async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      // Look up only the avatarKey — nothing sensitive
      const user = await User.findById(userId).select("avatarKey").lean();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const avatarKey = (user as any).avatarKey;
      if (!avatarKey) {
        return res.status(404).json({ message: "No avatar set for this user" });
      }

      const { stream, contentType, contentLength } = await streamFromS3(avatarKey);

      // Set response headers — let browser cache for 1 hour
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "private, max-age=3600");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      // Pipe the S3 readable stream straight to the HTTP response
      stream.pipe(res);

      stream.on("error", (err) => {
        logger.error("Avatar stream error", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to stream avatar" });
        }
      });
    } catch (err) {
      logger.error("UserProfileController.streamAvatar", err);
      if (!res.headersSent) {
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}
