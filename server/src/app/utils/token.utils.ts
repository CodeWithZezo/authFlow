import crypto from "crypto";

/**
 * Hash a refresh token with SHA-256 before storing in DB.
 * The raw token lives only in the httpOnly cookie.
 * If the DB is ever compromised, hashed tokens cannot be replayed.
 */
export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");
