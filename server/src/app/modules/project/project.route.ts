import { Router } from "express";
import { ProjectController } from "./project.controller";
import { authenticate, roleAuthorize } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router({ mergeParams: true });
const projectController = new ProjectController();

router.use(cookieParser());

// ─── Project CRUD ─────────────────────────────────────────────────────────────
// Require org-level membership for project CRUD
router.post("/", authenticate, roleAuthorize(["admin", "owner"], "organization"), projectController.createProject);
router.get("/", authenticate, roleAuthorize(["admin", "owner", "member"], "organization"), projectController.getProjects);
router.get("/:projectId", authenticate, roleAuthorize(["admin", "owner", "member"], "organization"), projectController.getProject);
router.patch("/:projectId", authenticate, roleAuthorize(["admin", "owner"], "organization"), projectController.updateProject);
router.delete("/:projectId", authenticate, roleAuthorize(["owner"], "organization"), projectController.deleteProject);

// ─── Project Members ──────────────────────────────────────────────────────────
// "manager" is the role auto-assigned to project creators — it must be included.
router.post("/:projectId/members", authenticate, roleAuthorize(["admin", "owner", "manager"], "project"), projectController.addProjectMember);
router.get("/:projectId/members", authenticate, roleAuthorize(["admin", "owner", "manager", "contributor", "viewer"], "project"), projectController.getProjectMembers);
router.get("/:projectId/members/:userId", authenticate, roleAuthorize(["admin", "owner", "manager", "contributor", "viewer"], "project"), projectController.getProjectMember);
router.patch("/:projectId/members/:userId", authenticate, roleAuthorize(["admin", "owner", "manager"], "project"), projectController.updateProjectMember);
router.delete("/:projectId/members/:userId", authenticate, roleAuthorize(["admin", "owner", "manager"], "project"), projectController.removeProjectMember);

export default router;
