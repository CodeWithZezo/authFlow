// tests/integration/auth/login.test.ts
// Tests POST /api/v1/auth/login against real in-memory MongoDB.

import request from "supertest";
import app from "../../helpers/app.js";
import { createUser } from "../../helpers/factories.js";

describe("POST /api/v1/auth/login", () => {
  // ── Success ────────────────────────────────────────────────────────────────
  it("returns 200 with user data on valid credentials", async () => {
    const { user, plainPassword } = await createUser({
      email: "login@example.com",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: plainPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged in/i);
    expect(res.body.user.email).toBe("login@example.com");
  });

  it("sets accessToken and refreshToken HTTP-only cookies on success", async () => {
    const { user, plainPassword } = await createUser({
      email: "cookielogin@example.com",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: plainPassword,
    });

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const cookieStr = cookies.join("; ");
    expect(cookieStr).toContain("accessToken");
    expect(cookieStr).toContain("refreshToken");
    expect(cookieStr).toContain("HttpOnly");
  });

  it("does not include raw tokens in the response body", async () => {
    const { user, plainPassword } = await createUser({
      email: "notoken@example.com",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: plainPassword,
    });

    expect(res.body.accessToken).toBeUndefined();
    expect(res.body.refreshToken).toBeUndefined();
  });

  it("is case-insensitive for email", async () => {
    const { user, plainPassword } = await createUser({
      email: "casetest@example.com",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "CASETEST@EXAMPLE.COM",
      password: plainPassword,
    });

    expect(res.status).toBe(200);
  });

  // ── Failures ───────────────────────────────────────────────────────────────
  it("returns 404 when the email is not registered", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "nobody@example.com",
      password: "ValidPass1!",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("returns 401 when the password is wrong", async () => {
    const { user } = await createUser({ email: "wrongpass@example.com" });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: "WrongPass1!",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("returns 401 for an empty password", async () => {
    const { user } = await createUser({ email: "emptypass@example.com" });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: "",
    });

    expect(res.status).toBe(401);
  });

  it("creates a new session document on each login", async () => {
    const { user, plainPassword } = await createUser({
      email: "session@example.com",
    });

    // Login twice — should create two sessions
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: plainPassword });
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: plainPassword });

    const { Session } =
      await import("../../../models/schema/session.schema.js");
    const sessions = await (Session as any).find({ userId: user._id });
    expect(sessions.length).toBe(2);
  });
});
