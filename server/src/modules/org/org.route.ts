import { Router } from "express";
import { OrgController } from "./org.controller";
import { authenticate, roleAuthorize } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router();
const orgController = new OrgController();

router.use(cookieParser());

// ─── Organization CRUD ────────────────────────────────────────────────────────
router.post("/", authenticate, orgController.createOrg);
router.get("/:orgId", authenticate, orgController.getOrg);
router.patch("/:orgId", authenticate, roleAuthorize(["admin", "owner"], "organization"), orgController.updateOrg);
router.delete("/:orgId", authenticate, roleAuthorize("owner", "organization"), orgController.deleteOrg);

// ─── Organization Members ─────────────────────────────────────────────────────
router.get("/:orgId/members", authenticate, roleAuthorize(["admin", "owner","member"], "organization"), orgController.getOrgMembers);
router.post("/:orgId/members", authenticate, roleAuthorize(["admin", "owner"], "organization"), orgController.addOrgMember);
router.get("/:orgId/members/:userId", authenticate, roleAuthorize(["admin", "owner","member"], "organization"), orgController.getOrgMember);
router.patch("/:orgId/members/:userId", authenticate, roleAuthorize(["admin", "owner"], "organization"), orgController.updateOrgMember);
router.delete("/:orgId/members/:userId", authenticate, roleAuthorize(["admin", "owner"], "organization"), orgController.removeOrgMember);

export default router;
 