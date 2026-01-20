// org.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { OrgController } from "./org.controller";

const router = Router();
const orgController = new OrgController();

router.post("/create-org", authenticate, orgController.createOrgController);

export default router;