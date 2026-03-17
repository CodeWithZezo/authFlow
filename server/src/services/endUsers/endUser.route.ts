// org.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { EndUserController } from "./endUser.controller";
import { resolveProjectContext } from "../../middleware/endUser.middleware";

const router = Router({ mergeParams: true });
const endUserController = new EndUserController();

router.post("/signup", resolveProjectContext, endUserController.signup);
router.post("/login", resolveProjectContext, endUserController.login);
router.get("/logout",authenticate,resolveProjectContext, endUserController.logout);
// router.post("/refresh-token", endUserController.refreshToken);
// router.get("/me", authenticate, endUserController.me);
export default router;
