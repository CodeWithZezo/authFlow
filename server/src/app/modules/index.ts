import { Router } from "express";
import userRouter from "./user/user.route";
import orgRouter from "./org/org.route";
import projectRouter from "./project/project.route";
import projectPolicyRouter from "./projectPolicy/projectPolicy.route";
import passwordPolicyRouter from "./passwordPolicy/passwordPolicy.route";
import sessionRouter from "./session/session.route";
import endUserRouter from "../services/endUsers/endUser.route";

const router = Router();

// ─── Auth / User ──────────────────────────────────────────────────────────────
router.use("/auth", userRouter);

// ─── Organizations + Members ──────────────────────────────────────────────────
router.use("/organizations", orgRouter);

// ─── Projects + Project Members ───────────────────────────────────────────────
orgRouter.use("/:orgId/projects", projectRouter);

// ─── Project Policy ───────────────────────────────────────────────────────────
router.use("/projects/:projectId/policy", projectPolicyRouter);

// ─── Password Policy ──────────────────────────────────────────────────────────
router.use("/projects/:projectId/password-policy", passwordPolicyRouter);

// ─── Sessions ─────────────────────────────────────────────────────────────────
router.use("/sessions", sessionRouter);

// ─── End Users ────────────────────────────────────────────────────────────────
router.use("/project/:projectId/end-user", endUserRouter);

export default router;
