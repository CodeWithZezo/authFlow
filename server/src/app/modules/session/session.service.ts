import { Session } from "../../models/schema/session.schema";
import { IServiceResponse } from "../../types/auth.types";
import { logger } from "../../utils/logger";

export class SessionService {

  // ─── Get All Sessions For User ──────────────────────────────────────────────
  async getSessions(userId: string): Promise<IServiceResponse<any>> {
    try {
      const sessions = await Session.find({ userId })
        .select("-refreshToken") // never expose raw refresh tokens
        .sort({ createdAt: -1 })
        .lean();

      return {
        status: 200,
        body: {
          message: "Sessions fetched successfully",
          count: sessions.length,
          sessions,
        },
      };
    } catch (error) {
      logger.error("SessionService.getSessions", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Revoke Single Session ──────────────────────────────────────────────────
  async revokeSession(
    userId: string,
    sessionId: string
  ): Promise<IServiceResponse<any>> {
    try {
      // Scope deletion to userId — prevents a user revoking someone else's session
      const session = await Session.findOneAndDelete({
        _id: sessionId,
        userId,
      }).lean();

      if (!session) {
        return { status: 404, body: { message: "Session not found" } };
      }

      return {
        status: 200,
        body: {
          message: "Session revoked successfully",
          isCurrentSession: false, // controller uses this to decide if cookies should be cleared
        },
      };
    } catch (error) {
      logger.error("SessionService.revokeSession", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Revoke All Sessions ────────────────────────────────────────────────────
  async revokeAllSessions(userId: string): Promise<IServiceResponse<any>> {
    try {
      const result = await Session.deleteMany({ userId });

      return {
        status: 200,
        body: {
          message: "All sessions revoked successfully",
          revokedCount: result.deletedCount,
        },
      };
    } catch (error) {
      logger.error("SessionService.revokeAllSessions", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
