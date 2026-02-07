// org.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { OrgController } from "./org.controller";

const router = Router();
const orgController = new OrgController();

router.post("/create-org", authenticate, orgController.createOrgController);
router.post("/get-all-org", authenticate, orgController.getAllOrgController);
// router.post("/delete-org/", authenticate, orgController.deleteOrgController);
// router.get("/:orgId", authenticate, orgController.getOrgController);

// router.post("/update-org", authenticate, orgController.updateOrgController);
export default router;