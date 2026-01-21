import { Router } from "express";
import cookieParser from "cookie-parser";
import { authenticate } from "../../middleware/auth.middleware";
import { ServiceController } from "./service.controller";

const router = Router();
router.use(cookieParser());
    
const serviceController = new ServiceController();

router.post("/get-api", authenticate, serviceController.getApiKeyController);

export default router;
