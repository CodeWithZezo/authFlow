// tests/integration/sessions/sessions.test.ts
// Tests GET/DELETE /api/v1/sessions

import request from "supertest";
import app from "../../helpers/app.js";
import {
  createUser,
  createSession,
  authCookiesForUser,
} from "../../helpers/factories.js";

// ─── GET /sessions ────────────────────────────────────────────────────────────
describe("GET /api/v1/sessions", () => {
  it("returns 200 with sessions list for an authenticated user", async () => {
    const { user } = await createUser({ email: "sessions-get@example.com" });
    await createSession(user._id);
    await createSession(user._id);
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get("/api/v1/sessions")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sessions)).toBe(true);
    // 2 created + 1 from authCookiesForUser = 3
    expect(res.body.sessions.length).toBe(3);
    expect(res.body.count).toBe(3);
  });

  it("does not return the refreshToken field on any session", async () => {
    const { user } = await createUser({
      email: "sessions-notoken@example.com",
    });
    await createSession(user._id);
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get("/api/v1/sessions")
      .set("Cookie", cookieHeader);

    res.body.sessions.forEach((s: any) => {
      expect(s.refreshToken).toBeUndefined();
    });
  });

  it("returns sessions sorted newest first", async () => {
    const { user } = await createUser({ email: "sessions-sorted@example.com" });
    const s1 = await createSession(user._id);
    const s2 = await createSession(user._id);
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get("/api/v1/sessions")
      .set("Cookie", cookieHeader);

    const ids = res.body.sessions.map((s: any) => s._id);
    // Most recent should be first — authCookiesForUser created last
    expect(ids[0]).not.toBe(s1.session._id.toString());
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/v1/sessions");
    expect(res.status).toBe(401);
  });

  it("returns an empty sessions array for a user with no active sessions", async () => {
    const { user } = await createUser({ email: "sessions-empty@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    // Delete the session that was just created by authCookiesForUser
    const { Session } =
      await import("../../../models/schema/session.schema.js");
    await (Session as any).deleteMany({ userId: user._id });

    // Create a fresh valid token to still authenticate (session is gone but cookie is still valid JWT)
    const { JWTUtils } = await import("../../../utils/jwt.utils.js");
    const freshToken = JWTUtils.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const res = await request(app)
      .get("/api/v1/sessions")
      .set("Cookie", `accessToken=${freshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(0);
  });
});

// ─── DELETE /sessions/:sessionId ──────────────────────────────────────────────
describe("DELETE /api/v1/sessions/:sessionId", () => {
  it("revokes a specific session — returns 200", async () => {
    const { user } = await createUser({ email: "sessions-revoke@example.com" });
    const { session } = await createSession(user._id);
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .delete(`/api/v1/sessions/${session._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/revoked/i);
  });

  it("the revoked session no longer appears in the sessions list", async () => {
    const { user } = await createUser({
      email: "sessions-afterrevoke@example.com",
    });
    const { session } = await createSession(user._id);
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    await request(app)
      .delete(`/api/v1/sessions/${session._id}`)
      .set("Cookie", cookieHeader);

    const listRes = await request(app)
      .get("/api/v1/sessions")
      .set("Cookie", cookieHeader);

    const ids = listRes.body.sessions.map((s: any) => s._id.toString());
    expect(ids).not.toContain(session._id.toString());
  });

  it("returns 404 when the session does not exist", async () => {
    const { user } = await createUser({
      email: "sessions-notfound@example.com",
    });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .delete("/api/v1/sessions/000000000000000000000000")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(404);
  });

  it("cannot revoke a session belonging to another user", async () => {
    const userA = await createUser({ email: "sessions-a@example.com" });
    const userB = await createUser({ email: "sessions-b@example.com" });
    const { session: sessionA } = await createSession(userA.user._id);
    const { cookieHeader: cookieB } = await authCookiesForUser(
      userB.user._id,
      userB.user.email,
    );

    const res = await request(app)
      .delete(`/api/v1/sessions/${sessionA._id}`)
      .set("Cookie", cookieB);

    // Should be 404 — session not found for this userId
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /sessions (revoke all) ────────────────────────────────────────────
describe("DELETE /api/v1/sessions", () => {
  it("revokes all sessions and returns the count — returns 200", async () => {
    const { user } = await createUser({
      email: "sessions-revokeall@example.com",
    });
    await createSession(user._id);
    await createSession(user._id);
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .delete("/api/v1/sessions")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.revokedCount).toBeGreaterThanOrEqual(3);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).delete("/api/v1/sessions");
    expect(res.status).toBe(401);
  });
});
