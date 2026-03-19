import { Router } from "express";
import { UserController } from "./user.controller";
import { UserProfileController } from "./userProfile.controller";
import cookieParser from "cookie-parser";
import { authenticate } from "../../middleware/auth.middleware";
import { avatarUpload } from "../../middleware/upload.middleware";

const router = Router();
const userController = new UserController();
const profileController = new UserProfileController();

router.use(cookieParser());

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/me", authenticate, userController.currentUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/logout", authenticate, userController.logout);
router.patch("/change-password", authenticate, userController.requestPasswordReset);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", authenticate, profileController.getProfile);
router.patch("/profile", authenticate, profileController.updateProfile);

// ─── Avatar ───────────────────────────────────────────────────────────────────
// PATCH  /auth/avatar        — upload (multipart/form-data, field: "avatar", max 5 MB)
// DELETE /auth/avatar        — remove avatar
// GET    /auth/avatar/:userId — stream avatar bytes (no S3 URL exposed)
router.patch("/avatar", authenticate, ...avatarUpload, profileController.uploadAvatar);
router.delete("/avatar", authenticate, profileController.deleteAvatar);
router.get("/avatar/:userId", authenticate, profileController.streamAvatar);

export default router;

