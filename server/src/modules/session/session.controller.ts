import { Response } from "express";
import { SessionService } from "./session.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService?: SessionService) {
    this.sessionService = sessionService ?? new SessionService();
  }

  // GET /sessions — list all active sessions for current user
  getSessions = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.sessionService.getSessions(
        req.user!.userId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // DELETE /sessions/:sessionId — revoke a specific session
  revokeSession = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.sessionService.revokeSession(
        req.user!.userId,
        req.params.sessionId
      );

      // If revoking current session, clear cookies
      if (body.isCurrentSession) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
      }

      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // DELETE /sessions — revoke ALL sessions (logout everywhere)
  revokeAllSessions = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.sessionService.revokeAllSessions(
        req.user!.userId
      );

      // Always clear cookies when revoking all sessions
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
