import { Router } from "express";
import { UserController } from "./user.controller";
import cookieParser from "cookie-parser";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

router.use(cookieParser());

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/me", authenticate, userController.currentUser);         // FIX: was POST
router.post("/refresh-token", userController.refreshToken);
router.post("/logout", authenticate, userController.logout);
router.patch("/change-password", authenticate, userController.requestPasswordReset);

export default router;
