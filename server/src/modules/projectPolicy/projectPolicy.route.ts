import { Router } from "express";
import { ProjectPolicyController } from "./projectPolicy.controller";
import { authenticate, roleAuthorize } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router({ mergeParams: true }); // access :projectId from parent
const projectPolicyController = new ProjectPolicyController();

router.use(cookieParser());

// ─── Project Policy ───────────────────────────────────────────────────────────
// Mount at: /api/v1/projects/:projectId/policy
router.post("/", authenticate, roleAuthorize(["manager", "contributor"], "project"), projectPolicyController.createPolicy);
router.get("/", authenticate, roleAuthorize(["manager", "viewer", "contributor"], "project"), projectPolicyController.getPolicy);
router.patch("/", authenticate, roleAuthorize(["manager", "contributor"], "project"), projectPolicyController.updatePolicy);
router.delete("/", authenticate, roleAuthorize(["manager", "contributor"], "project"), projectPolicyController.deletePolicy);

export default router;
