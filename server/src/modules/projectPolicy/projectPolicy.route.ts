import { Router } from "express";
import { ProjectPolicyController } from "./projectPolicy.controller";
import { authenticate, roleAuthorize } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router({ mergeParams: true }); // access :projectId from parent
const projectPolicyController = new ProjectPolicyController();

router.use(cookieParser());

// ─── Project Policy ───────────────────────────────────────────────────────────
// Mount at: /api/v1/projects/:projectId/policy
router.post("/", authenticate, roleAuthorize("admin", "project"), projectPolicyController.createPolicy);
router.get("/", authenticate, roleAuthorize("member", "project"), projectPolicyController.getPolicy);
router.patch("/", authenticate, roleAuthorize("admin", "project"), projectPolicyController.updatePolicy);
router.delete("/", authenticate, roleAuthorize("owner", "project"), projectPolicyController.deletePolicy);

export default router;
