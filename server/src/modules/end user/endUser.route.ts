// org.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { EndUserController } from "./endUser.controller";

const router = Router();
const endUserController = new EndUserController();

router.post("/signup", endUserController.signup);

export default router;
