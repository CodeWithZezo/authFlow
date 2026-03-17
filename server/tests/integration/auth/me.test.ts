// tests/integration/auth/me.test.ts
// Tests GET /api/v1/auth/me — requires valid accessToken cookie.

import request from "supertest";
import app     from "../../helpers/app";
import { createUser, authCookiesForUser } from "../../helpers/factories";

describe("GET /api/v1/auth/me", () => {

  it("returns 200 with the user document when authenticated", async () => {
    const { user } = await createUser({ email: "me@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("returns the user _id field (raw Mongoose doc uses _id not id)", async () => {
    const { user } = await createUser({ email: "meid@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookieHeader);

    expect(res.body.user._id).toBeDefined();
  });

  it("does not return the passwordHash field", async () => {
    const { user } = await createUser({ email: "nohash@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookieHeader);

    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("returns 401 when no accessToken cookie is provided", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
  });

  it("returns 401 when the accessToken cookie is expired or tampered", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", "accessToken=invalid.token.here");

    expect(res.status).toBe(401);
  });

  it("returns 404 when the userId in the token no longer exists in the DB", async () => {
    const { JWTUtils } = await import("../../../src/utils/jwt.utils");
    // Use a valid-looking but non-existent ObjectId
    const fakeToken = JWTUtils.generateAccessToken({
      userId: "000000000000000000000000",
      email:  "ghost@example.com",
    });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", `accessToken=${fakeToken}`);

    expect(res.status).toBe(404);
  });
});
