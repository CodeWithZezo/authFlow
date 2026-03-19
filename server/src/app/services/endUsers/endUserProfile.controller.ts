import { Request, Response } from "express";
import { ResolvedRequest } from "../../middleware/endUser.middleware";
import { EndUserProfileService } from "./endUserProfile.service";
import { User } from "../../models/schema/user.schema";
import { streamFromS3 } from "../../utils/s3.utils";
import { logger } from "../../utils/logger";

export class EndUserProfileController {
  private profileService = new EndUserProfileService();

  // ─── GET /project/:projectId/end-user/profile ────────────────────────────────
  getProfile = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { projectId } = req.params;

      if (!user?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { status, body } = await this.profileService.getProfile(
        user.userId,
        projectId
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── PATCH /project/:projectId/end-user/profile ──────────────────────────────
  updateProfile = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { projectId } = req.params;

      if (!user?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { fullName, phone } = req.body;
      const { status, body } = await this.profileService.updateProfile(
        user.userId,
        projectId,
        { fullName, phone }
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── PATCH /project/:projectId/end-user/avatar ───────────────────────────────
  uploadAvatar = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { projectId } = req.params;

      if (!user?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No image file provided. Use field name 'avatar'." });
      }

      const { status, body } = await this.profileService.uploadAvatar(
        user.userId,
        projectId,
        req.file.buffer
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── DELETE /project/:projectId/end-user/avatar ──────────────────────────────
  deleteAvatar = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { status, body } = await this.profileService.deleteAvatar(
        user.userId
      );
      return res.status(status).json(body);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── GET /project/:projectId/end-user/avatar/:userId ─────────────────────────
  // Streams avatar bytes from S3 to the client.
  // The S3 object URL is NEVER sent to the frontend.
  streamAvatar = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select("avatarKey").lean();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const avatarKey = (user as any).avatarKey;
      if (!avatarKey) {
        return res.status(404).json({ message: "No avatar set for this user" });
      }

      const { stream, contentType, contentLength } = await streamFromS3(avatarKey);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "private, max-age=3600");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      stream.pipe(res);

      stream.on("error", (err) => {
        logger.error("EndUser avatar stream error", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to stream avatar" });
        }
      });
    } catch (err) {
      logger.error("EndUserProfileController.streamAvatar", err);
      if (!res.headersSent) {
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}
