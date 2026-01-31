// org.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { EndUserController } from "./endUser.controller";
import { resolveProjectContext } from "../../middleware/endUser.middleware";

const router = Router({ mergeParams: true });
const endUserController = new EndUserController();

router.post("/signup", resolveProjectContext, endUserController.signup);

export default router;
