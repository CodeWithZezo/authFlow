import { Router } from "express";
import cookieParser from "cookie-parser";
import { ServiceController } from "./service.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.use(cookieParser());
    
const serviceController = new ServiceController();

router.post("/get-api", authenticate, serviceController.getApiKeyController);

export default router;
