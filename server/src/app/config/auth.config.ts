export const authConfig = {
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || "codewithzezo",
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "codewithzezo",
    accessTokenExpiry: "15m",   // 15 minutes
    refreshTokenExpiry: "7d",   // 7 days
  },
  bcrypt: {
    saltRoundes: 10,
  },
  password: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
};
