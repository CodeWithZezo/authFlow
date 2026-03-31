// ── Validate required secrets at startup ─────────────────────────────────────
// In production these MUST be set. We throw immediately so the app never starts
// with a weak default — a silent fallback would be a security hole.
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (process.env.NODE_ENV === "production") {
  if (!accessSecret) throw new Error("JWT_ACCESS_SECRET must be set in production");
  if (!refreshSecret) throw new Error("JWT_REFRESH_SECRET must be set in production");
}

export const authConfig = {
  jwt: {
    accessTokenSecret: accessSecret ?? "dev-access-secret-change-in-production",
    refreshTokenSecret: refreshSecret ?? "dev-refresh-secret-change-in-production",
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
  },
  bcrypt: {
    // 8 rounds in dev/test (~40ms), 10 rounds in production (~100ms).
    saltRoundes: process.env.NODE_ENV === "production" ? 10 : 8,
  },
  password: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
};
