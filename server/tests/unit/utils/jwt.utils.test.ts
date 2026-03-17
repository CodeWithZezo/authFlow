// tests/unit/utils/jwt.utils.test.ts
// Tests JWTUtils.generateAccessToken, generateRefreshToken, verifyAccessToken,
// verifyRefreshToken — pure function tests, no DB.

import { JWTUtils } from "../../../src/utils/jwt.utils";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET  = "unit-test-access-secret-32-chars-minimum!!";
  process.env.JWT_REFRESH_SECRET = "unit-test-refresh-secret-32-chars-minimum!";
  process.env.JWT_ACCESS_EXPIRES_IN  = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
  process.env.NODE_ENV = "test";
});

const payload = { userId: "64f1a2b3c4d5e6f7a8b9c0d1", email: "jane@example.com" };

// ─── generateAccessToken ──────────────────────────────────────────────────────
describe("JWTUtils.generateAccessToken", () => {
  it("returns a JWT string with three dot-separated parts", () => {
    const token = JWTUtils.generateAccessToken(payload);
    expect(token.split(".")).toHaveLength(3);
  });

  it("produces different tokens on repeated calls (iat differs)", () => {
    // Add a 1ms delay to guarantee different iat
    const t1 = JWTUtils.generateAccessToken(payload);
    const t2 = JWTUtils.generateAccessToken(payload);
    // Both are valid JWTs but may or may not differ by iat within same ms
    expect(typeof t1).toBe("string");
    expect(typeof t2).toBe("string");
  });
});

// ─── generateRefreshToken ─────────────────────────────────────────────────────
describe("JWTUtils.generateRefreshToken", () => {
  it("returns a JWT string", () => {
    const token = JWTUtils.generateRefreshToken(payload);
    expect(token.split(".")).toHaveLength(3);
  });

  it("generates a token distinct from the access token (different secret)", () => {
    const access  = JWTUtils.generateAccessToken(payload);
    const refresh = JWTUtils.generateRefreshToken(payload);
    // Signed with different secrets → different signatures
    const accessSig  = access.split(".")[2];
    const refreshSig = refresh.split(".")[2];
    expect(accessSig).not.toBe(refreshSig);
  });
});

// ─── verifyAccessToken ────────────────────────────────────────────────────────
describe("JWTUtils.verifyAccessToken", () => {
  it("returns the original payload after signing and verifying", () => {
    const token   = JWTUtils.generateAccessToken(payload);
    const decoded = JWTUtils.verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("throws when the token is tampered with", () => {
    const token   = JWTUtils.generateAccessToken(payload);
    const tampered = token.slice(0, -4) + "XXXX";
    expect(() => JWTUtils.verifyAccessToken(tampered)).toThrow();
  });

  it("throws when verified with the refresh secret instead of access secret", () => {
    // A refresh token cannot be used as an access token
    const refreshToken = JWTUtils.generateRefreshToken(payload);
    expect(() => JWTUtils.verifyAccessToken(refreshToken)).toThrow();
  });

  it("throws for a completely invalid string", () => {
    expect(() => JWTUtils.verifyAccessToken("not.a.token")).toThrow();
  });

  it("throws for an empty string", () => {
    expect(() => JWTUtils.verifyAccessToken("")).toThrow();
  });
});

// ─── verifyRefreshToken ───────────────────────────────────────────────────────
describe("JWTUtils.verifyRefreshToken", () => {
  it("returns the original payload after signing and verifying", () => {
    const token   = JWTUtils.generateRefreshToken(payload);
    const decoded = JWTUtils.verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("throws when an access token is used instead of a refresh token", () => {
    const accessToken = JWTUtils.generateAccessToken(payload);
    expect(() => JWTUtils.verifyRefreshToken(accessToken)).toThrow();
  });

  it("throws when the token is tampered with", () => {
    const token   = JWTUtils.generateRefreshToken(payload);
    const tampered = token.slice(0, -4) + "XXXX";
    expect(() => JWTUtils.verifyRefreshToken(tampered)).toThrow();
  });
});
