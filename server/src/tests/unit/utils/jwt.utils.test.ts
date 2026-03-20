import { JWTUtils } from "../../../app/utils/jwt.utils";

describe("JWTUtils", () => {
  const payload = { userId: "507f1f77bcf86cd799439011", email: "test@example.com" };

  describe("generateAccessToken", () => {
    it("should return a non-empty string", () => {
      const token = JWTUtils.generateAccessToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    // FIX: jti (UUID) is now embedded in every token, so two tokens generated
    // from the same payload are always different — this is the correct behaviour
    // that enables token rotation to work even within the same second.
    it("should produce different tokens on separate calls (jti uniqueness)", () => {
      const t1 = JWTUtils.generateAccessToken(payload);
      const t2 = JWTUtils.generateAccessToken(payload);
      expect(t1).not.toBe(t2);
    });
  });

  describe("generateRefreshToken", () => {
    it("should return a string", () => {
      const token = JWTUtils.generateRefreshToken(payload);
      expect(typeof token).toBe("string");
    });

    it("refresh token should differ from access token", () => {
      const access = JWTUtils.generateAccessToken(payload);
      const refresh = JWTUtils.generateRefreshToken(payload);
      expect(access).not.toBe(refresh);
    });

    it("two refresh tokens from same payload are always different (jti)", () => {
      const r1 = JWTUtils.generateRefreshToken(payload);
      const r2 = JWTUtils.generateRefreshToken(payload);
      expect(r1).not.toBe(r2);
    });
  });

  describe("verifyAccessToken", () => {
    it("should decode a valid access token and match payload", () => {
      const token = JWTUtils.generateAccessToken(payload);
      const decoded = JWTUtils.verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it("should throw for a tampered token", () => {
      const token = JWTUtils.generateAccessToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(() => JWTUtils.verifyAccessToken(tampered)).toThrow();
    });

    it("should throw for a refresh token passed to verifyAccessToken", () => {
      const refresh = JWTUtils.generateRefreshToken(payload);
      expect(() => JWTUtils.verifyAccessToken(refresh)).toThrow();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should decode a valid refresh token", () => {
      const token = JWTUtils.generateRefreshToken(payload);
      const decoded = JWTUtils.verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it("should throw for an access token passed to verifyRefreshToken", () => {
      const access = JWTUtils.generateAccessToken(payload);
      expect(() => JWTUtils.verifyRefreshToken(access)).toThrow();
    });

    it("should throw for an empty string", () => {
      expect(() => JWTUtils.verifyRefreshToken("")).toThrow();
    });
  });
});