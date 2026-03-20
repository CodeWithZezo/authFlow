import request from "supertest";
import app from "../../../app";
import { createTestUser, createVerifiedUser } from "../../helpers/testFactories";
import { Session } from "../../../app/models/schema/session.schema";

const BASE = "/api/v1/auth";

const getCookies = (res: request.Response): string[] => {
  const raw = res.headers["set-cookie"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw as unknown as string];
};

describe("Auth Integration", () => {
  // ─── POST /auth/signup ──────────────────────────────────────────────────────
  describe("POST /auth/signup", () => {
    it("returns 201 and creates user with tokens in cookies", async () => {
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({ fullName: "Alice", email: "alice@test.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("alice@test.com");
      expect(res.body.user).not.toHaveProperty("passwordHash");
      const cookies = getCookies(res);
      expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
      expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
    });

    it("returns 400 for duplicate email", async () => {
      await createTestUser({ email: "dup@test.com" });
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({ fullName: "Dup", email: "dup@test.com", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/email already exists/i);
    });

    it("returns 400 for password too short", async () => {
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({ fullName: "Bob", email: "bob@test.com", password: "ab" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    // FIX: missing password now returns 400 (guarded before .validate())
    it("returns 400 when password is missing", async () => {
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({ fullName: "Bob", email: "nopass@test.com" });

      expect(res.status).toBe(400);
    });
  });

  // ─── POST /auth/login ───────────────────────────────────────────────────────
  describe("POST /auth/login", () => {
    it("returns 200 with tokens on valid credentials", async () => {
      await createTestUser({ email: "login@test.com", password: "password123" });

      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: "login@test.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("login@test.com");
      const cookies = getCookies(res);
      expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    });

    it("returns 404 for unknown email", async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: "ghost@test.com", password: "password123" });
      expect(res.status).toBe(404);
    });

    it("returns 401 for wrong password", async () => {
      await createTestUser({ email: "wrongpw@test.com", password: "correct123" });
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: "wrongpw@test.com", password: "wrongpass" });
      expect(res.status).toBe(401);
    });

    it("does not expose passwordHash in response", async () => {
      await createTestUser({ email: "secure@test.com", password: "password123" });
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: "secure@test.com", password: "password123" });

      expect(res.body.user).not.toHaveProperty("passwordHash");
    });
  });

  // ─── GET /auth/me ────────────────────────────────────────────────────────────
  describe("GET /auth/me", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app).get(`${BASE}/me`);
      expect(res.status).toBe(401);
    });

    it("returns 200 with user data when authenticated", async () => {
      const { accessToken } = await createVerifiedUser("me@test.com");

      const res = await request(app)
        .get(`${BASE}/me`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("me@test.com");
      expect(res.body.user).not.toHaveProperty("passwordHash");
      expect(res.body.user).not.toHaveProperty("avatarKey");
      expect(res.body.user).not.toHaveProperty("privateMetadata");
    });
  });

  // ─── POST /auth/refresh-token ────────────────────────────────────────────────
  describe("POST /auth/refresh-token", () => {
    it("returns 401 when no refresh token", async () => {
      const res = await request(app).post(`${BASE}/refresh-token`);
      expect(res.status).toBe(401);
    });

    it("returns 200 and rotates tokens with valid refresh token", async () => {
      const { refreshToken } = await createVerifiedUser("refresh@test.com");

      const res = await request(app)
        .post(`${BASE}/refresh-token`)
        .set("Cookie", `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      const cookies = getCookies(res);
      expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
      expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
    });

    // FIX: after the first refresh the old session is deleted.
    // The second call with the SAME old token must fail with 401
    // because that session no longer exists in the DB.
    it("returns 401 when refresh token already revoked (token rotation)", async () => {
      const { refreshToken: oldToken } = await createVerifiedUser("revoked@test.com");

      // First refresh — consumes the old token, creates a new session
      const first = await request(app)
        .post(`${BASE}/refresh-token`)
        .set("Cookie", `refreshToken=${oldToken}`);
      expect(first.status).toBe(200);

      // Second refresh with the ORIGINAL (now revoked) token — must fail
      const second = await request(app)
        .post(`${BASE}/refresh-token`)
        .set("Cookie", `refreshToken=${oldToken}`);

      expect(second.status).toBe(401);
    });
  });

  // ─── POST /auth/logout ───────────────────────────────────────────────────────
  describe("POST /auth/logout", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app).post(`${BASE}/logout`);
      expect(res.status).toBe(401);
    });

    it("returns 200 and deletes session on logout", async () => {
      const { user, accessToken, refreshToken } = await createVerifiedUser("logout@test.com");

      const sessionBefore = await Session.findOne({ userId: user._id });
      expect(sessionBefore).not.toBeNull();

      const res = await request(app)
        .post(`${BASE}/logout`)
        .set("Cookie", `accessToken=${accessToken}; refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);

      const sessionAfter = await Session.findOne({ userId: user._id });
      expect(sessionAfter).toBeNull();
    });
  });

  // ─── PATCH /auth/change-password ─────────────────────────────────────────────
  describe("PATCH /auth/change-password", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .patch(`${BASE}/change-password`)
        .send({ currentPassword: "old", newPassword: "new123" });
      expect(res.status).toBe(401);
    });

    it("returns 401 with wrong current password", async () => {
      const { accessToken } = await createVerifiedUser("chpw@test.com");

      const res = await request(app)
        .patch(`${BASE}/change-password`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({ currentPassword: "wrongpass", newPassword: "NewPass123" });

      expect(res.status).toBe(401);
    });

    it("returns 200 on successful password change", async () => {
      const { accessToken, password } = await createVerifiedUser("chpw2@test.com");

      const res = await request(app)
        .patch(`${BASE}/change-password`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({ currentPassword: password, newPassword: "NewPass456" });

      expect(res.status).toBe(200);
    });
  });
});
