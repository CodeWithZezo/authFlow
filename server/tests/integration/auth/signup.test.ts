// tests/integration/auth/signup.test.ts
// Tests POST /api/v1/auth/signup against real MongoDB (in-memory).
// Verifies response shapes, cookie presence, and duplicate rejection.

import request from "supertest";
import app     from "../../helpers/app";

describe("POST /api/v1/auth/signup", () => {
  const validPayload = {
    fullName: "Jane Doe",
    email:    "jane@example.com",
    password: "ValidPass1!",
    phone:    "923001234567",
  };

  // ── Success ────────────────────────────────────────────────────────────────
  it("returns 201 with user data on valid input", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created successfully/i);
    expect(res.body.user).toMatchObject({
      email:    "jane@example.com",
      fullName: "Jane Doe",
    });
    expect(res.body.user.id).toBeDefined();
  });

  it("sets accessToken and refreshToken HTTP-only cookies on success", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(validPayload);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies).toBeDefined();
    const cookieStr = cookies.join("; ");
    expect(cookieStr).toContain("accessToken");
    expect(cookieStr).toContain("refreshToken");
    expect(cookieStr).toContain("HttpOnly");
  });

  it("does NOT include accessToken or refreshToken in the response body", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(validPayload);

    expect(res.body.accessToken).toBeUndefined();
    expect(res.body.refreshToken).toBeUndefined();
  });

  it("lowercases the email before storing", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      ...validPayload, email: "JANE@EXAMPLE.COM",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("jane@example.com");
  });

  it("accepts signup without a phone number", async () => {
    const { phone, ...noPhone } = validPayload;
    const res = await request(app).post("/api/v1/auth/signup").send({
      ...noPhone, email: "nophone@example.com",
    });

    expect(res.status).toBe(201);
  });

  // ── Validation errors ──────────────────────────────────────────────────────
  it("returns 400 when the password is too weak", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      ...validPayload, password: "short",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("returns 400 when password has no uppercase letter", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      ...validPayload, password: "alllowercase1",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when password has no number", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      ...validPayload, password: "NoNumbersHere!",
    });
    expect(res.status).toBe(400);
  });

  // ── Conflict ───────────────────────────────────────────────────────────────
  it("returns 400 when the email is already registered", async () => {
    await request(app).post("/api/v1/auth/signup").send(validPayload);

    const res = await request(app).post("/api/v1/auth/signup").send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});
