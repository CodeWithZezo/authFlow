import { PasswordUtils } from "../../../app/utils/password.utils";

describe("PasswordUtils", () => {
  describe("hash", () => {
    it("should return a bcrypt hash string", async () => {
      const hash = await PasswordUtils.hash("MyPassword1");
      expect(typeof hash).toBe("string");
      expect(hash).toMatch(/^\$2b\$/);
    });

    it("should produce different hashes for the same password", async () => {
      const h1 = await PasswordUtils.hash("SamePass");
      const h2 = await PasswordUtils.hash("SamePass");
      expect(h1).not.toBe(h2); // different salts
    });
  });

  describe("compare", () => {
    it("should return true for matching password and hash", async () => {
      const hash = await PasswordUtils.hash("CorrectPass");
      const result = await PasswordUtils.compare("CorrectPass", hash);
      expect(result).toBe(true);
    });

    it("should return false for wrong password", async () => {
      const hash = await PasswordUtils.hash("CorrectPass");
      const result = await PasswordUtils.compare("WrongPass", hash);
      expect(result).toBe(false);
    });

    it("should return false for empty string against a real hash", async () => {
      const hash = await PasswordUtils.hash("SomePass");
      const result = await PasswordUtils.compare("", hash);
      expect(result).toBe(false);
    });
  });

  describe("validate", () => {
    it("should pass a password meeting the minimum length", () => {
      const result = PasswordUtils.validate("abc123"); // minLength = 6
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail a password shorter than minLength", () => {
      const result = PasswordUtils.validate("ab");
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("at least"))).toBe(true);
    });

    it("should return valid:true for a strong password", () => {
      const result = PasswordUtils.validate("StrongPassword99!");
      expect(result.valid).toBe(true);
    });

    it("should return an array of errors for a too-short password", () => {
      const result = PasswordUtils.validate("hi");
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
