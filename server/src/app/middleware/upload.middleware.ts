import { Request, Response, NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const OUTPUT_SIZE = 400; // resize to 400 × 400 px square

// ─── Multer — memory storage (we process before uploading to S3) ──────────────
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type. Allowed: ${ALLOWED_MIME.join(", ")}`
        )
      );
    }
  },
});

// ─── Multer error handler ─────────────────────────────────────────────────────
const handleMulterError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 5 MB." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// ─── Sharp resize middleware ──────────────────────────────────────────────────
// Runs AFTER multer. Resizes to OUTPUT_SIZE × OUTPUT_SIZE, converts to JPEG,
// strips EXIF data, and attaches the result back to req.file.
const sharpResize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return next(); // no file uploaded — skip silently

  try {
    const resized = await sharp(req.file.buffer)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
        fit: "cover",       // crop to fill the square
        position: "center", // center the crop
      })
      .jpeg({ quality: 85, progressive: true }) // always output JPEG
      .withMetadata({}) // strip EXIF but keep ICC profile
      .toBuffer();

    // Override multer's buffer with our processed image
    req.file.buffer = resized;
    req.file.mimetype = "image/jpeg";
    req.file.size = resized.length;

    next();
  } catch (err) {
    console.error("Sharp resize error:", err);
    return res
      .status(400)
      .json({ message: "Failed to process image. Ensure the file is a valid image." });
  }
};

// ─── Composed middleware stack ────────────────────────────────────────────────
// Usage in route: router.patch("/avatar", ...avatarUpload, controller.uploadAvatar)
export const avatarUpload = [
  // 1. Parse multipart/form-data and enforce size + type
  (req: Request, res: Response, next: NextFunction) =>
    multerUpload.single("avatar")(req, res, (err) =>
      handleMulterError(err, req, res, next)
    ),
  // 2. Resize / normalise with sharp
  sharpResize,
];
