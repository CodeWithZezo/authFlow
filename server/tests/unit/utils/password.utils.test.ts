// tests/unit/utils/password.utils.test.ts
// Tests PasswordUtils.hash, compare, and validate in isolation — no DB, no network.

import { PasswordUtils } from "../../../src/utils/password.utils";

// Unit tests: set env for config loading but no DB needed
beforeAll(() => {
  process.env.JWT_ACCESS_SECRET  = "unit-test-access-secret-32-chars-minimum";
  process.env.JWT_REFRESH_SECRET = "unit-test-refresh-secret-32-chars-minimum";
  process.env.NODE_ENV = "test";
});

// ─── hash ─────────────────────────────────────────────────────────────────────
describe("PasswordUtils.hash", () => {
  it("returns a bcrypt hash string", async () => {
    const hash = await PasswordUtils.hash("TestPass1!");
    expect(hash).toMatch(/^\$2[ab]\$\d+\$/);
  });

  it("produces different hashes for the same password (salt randomness)", async () => {
    const h1 = await PasswordUtils.hash("TestPass1!");
    const h2 = await PasswordUtils.hash("TestPass1!");
    expect(h1).not.toBe(h2);
  });

  it("returns a string longer than 50 characters", async () => {
    const hash = await PasswordUtils.hash("AnyPassword1");
    expect(hash.length).toBeGreaterThan(50);
  });
});

// ─── compare ──────────────────────────────────────────────────────────────────
describe("PasswordUtils.compare", () => {
  it("returns true when password matches its hash", async () => {
    const password = "CorrectHorseBattery1";
    const hash = await PasswordUtils.hash(password);
    await expect(PasswordUtils.compare(password, hash)).resolves.toBe(true);
  });

  it("returns false when password does not match the hash", async () => {
    const hash = await PasswordUtils.hash("CorrectHorseBattery1");
    await expect(PasswordUtils.compare("WrongPassword1", hash)).resolves.toBe(false);
  });

  it("returns false for an empty string against a real hash", async () => {
    const hash = await PasswordUtils.hash("SomePassword1!");
    await expect(PasswordUtils.compare("", hash)).resolves.toBe(false);
  });
});

// ─── validate ─────────────────────────────────────────────────────────────────
describe("PasswordUtils.validate", () => {
  it("returns valid for a password that meets all default rules", () => {
    const result = PasswordUtils.validate("ValidPass1!");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns invalid when the password is too short", () => {
    const result = PasswordUtils.validate("Ab1!");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("characters"))).toBe(true);
  });

  it("returns invalid when there is no uppercase letter", () => {
    const result = PasswordUtils.validate("alllowercase1");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("uppercase"))).toBe(true);
  });

  it("returns invalid when there is no lowercase letter", () => {
    const result = PasswordUtils.validate("ALLUPPERCASE1");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("lowercase"))).toBe(true);
  });

  it("returns invalid when there is no number", () => {
    const result = PasswordUtils.validate("NoNumbersHere!");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("number"))).toBe(true);
  });

  it("accumulates multiple errors for a very weak password", () => {
    const result = PasswordUtils.validate("short");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("returns invalid for an empty string", () => {
    const result = PasswordUtils.validate("");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
