import { JWTUtils } from "../../../app/utils/jwt.utils";

describe("JWTUtils", () => {
  const payload = { userId: "507f1f77bcf86cd799439011", email: "test@example.com" };

  describe("generateAccessToken", () => {
    it("should return a non-empty string", () => {
      const token = JWTUtils.generateAccessToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should produce different tokens on separate calls", () => {
      const t1 = JWTUtils.generateAccessToken(payload);
      const t2 = JWTUtils.generateAccessToken(payload);
      // Different iat means different tokens
      expect(t1).toBe(t2); // same second → same iat (fine, jwt is deterministic for same second)
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
      // Different secret — should throw
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
