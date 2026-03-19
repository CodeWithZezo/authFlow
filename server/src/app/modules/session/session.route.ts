import { Router } from "express";
import { SessionController } from "./session.controller";
import { authenticate } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router();
const sessionController = new SessionController();

router.use(cookieParser());

// ─── Sessions ─────────────────────────────────────────────────────────────────
// Mount at: /api/v1/sessions
router.get("/", authenticate, sessionController.getSessions);
router.delete("/", authenticate, sessionController.revokeAllSessions);
router.delete("/:sessionId", authenticate, sessionController.revokeSession);

export default router;
