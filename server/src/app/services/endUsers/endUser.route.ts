import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { EndUserController } from "./endUser.controller";
import { EndUserProfileController } from "./endUserProfile.controller";
import { resolveProjectContext } from "../../middleware/endUser.middleware";
import { avatarUpload } from "../../middleware/upload.middleware";

const router = Router({ mergeParams: true });
const endUserController = new EndUserController();
const profileController = new EndUserProfileController();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/signup", resolveProjectContext, endUserController.signup);
router.post("/login", resolveProjectContext, endUserController.login);
router.get("/logout", authenticate, resolveProjectContext, endUserController.logout);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", authenticate, resolveProjectContext, profileController.getProfile);
router.patch("/profile", authenticate, resolveProjectContext, profileController.updateProfile);

// ─── Avatar ───────────────────────────────────────────────────────────────────
// PATCH  /end-user/avatar          — upload (multipart/form-data, field: "avatar", max 5 MB)
// DELETE /end-user/avatar          — remove avatar
// GET    /end-user/avatar/:userId  — stream avatar bytes (no S3 URL exposed)
router.patch("/avatar", authenticate, ...avatarUpload, profileController.uploadAvatar);
router.delete("/avatar", authenticate, profileController.deleteAvatar);
router.get("/avatar/:userId", authenticate, profileController.streamAvatar);

export default router;
