import { Router } from "express";
import { PasswordPolicyController } from "./passwordPolicy.controller";
import { authenticate, roleAuthorize } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router({ mergeParams: true }); // access :projectId from parent
const passwordPolicyController = new PasswordPolicyController();

router.use(cookieParser());

// ─── Password Policy ──────────────────────────────────────────────────────────
// Mount at: /api/v1/projects/:projectId/password-policy
router.post("/", authenticate, roleAuthorize(["manager", "contributor"], "project"), passwordPolicyController.createPasswordPolicy);
router.get("/", authenticate, roleAuthorize(["manager", "viewer", "contributor"], "project"), passwordPolicyController.getPasswordPolicy);
router.patch("/", authenticate, roleAuthorize(["manager", "contributor"], "project"), passwordPolicyController.updatePasswordPolicy);
router.delete("/", authenticate, roleAuthorize(["manager", "contributor"], "project"), passwordPolicyController.deletePasswordPolicy);
 
export default router;
