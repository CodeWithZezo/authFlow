export const authConfig = {
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || "codewithzezo",
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "codewithzezo",
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
  },
  bcrypt: {
    // 8 rounds in dev/test (~40ms), 10 rounds in production (~100ms).
    // Each extra round doubles the time — 8 is still fully secure for dev.
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
