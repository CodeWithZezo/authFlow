import { Router } from "express";
import { ProjectController } from "./project.controller";
import { authenticate, roleAuthorize } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router({ mergeParams: true }); // mergeParams to access :orgId from parent router
const projectController = new ProjectController();

router.use(cookieParser());

// ─── Project CRUD ─────────────────────────────────────────────────────────────
// Mount at: /api/v1/organizations/:orgId/projects
router.post("/", authenticate, roleAuthorize("admin", "organization"), projectController.createProject);
router.get("/", authenticate, roleAuthorize("member", "organization"), projectController.getProjects);
router.get("/:projectId", authenticate, roleAuthorize("member", "organization"), projectController.getProject);
router.patch("/:projectId", authenticate, roleAuthorize("admin", "organization"), projectController.updateProject);
router.delete("/:projectId", authenticate, roleAuthorize("owner", "organization"), projectController.deleteProject);

// ─── Project Members ──────────────────────────────────────────────────────────
// Mount at: /api/v1/projects/:projectId/members
router.post("/:projectId/members", authenticate, roleAuthorize("admin", "project"), projectController.addProjectMember);
router.get("/:projectId/members", authenticate, roleAuthorize("member", "project"), projectController.getProjectMembers);
router.get("/:projectId/members/:userId", authenticate, roleAuthorize("member", "project"), projectController.getProjectMember);
router.patch("/:projectId/members/:userId", authenticate, roleAuthorize("admin", "project"), projectController.updateProjectMember);
router.delete("/:projectId/members/:userId", authenticate, roleAuthorize("admin", "project"), projectController.removeProjectMember);

export default router;
