import { Router } from "express";
import { UserController } from "./user.controller";
import cookieParser from "cookie-parser";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

router.use(cookieParser());

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/me", authenticate, userController.currentUser);

export default router;
