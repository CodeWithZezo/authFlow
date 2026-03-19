import request from "supertest";
import app from "../../../app";
import { createVerifiedUser } from "../../helpers/testFactories";

const BASE = "/api/v1/auth";

describe("User Profile Integration", () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const result = await createVerifiedUser();
    accessToken = result.accessToken;
    userId = result.user._id.toString();
  });

  // ─── GET /auth/profile ───────────────────────────────────────────────────────
  describe("GET /auth/profile", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app).get(`${BASE}/profile`);
      expect(res.status).toBe(401);
    });

    it("returns 200 with profile data", async () => {
      const res = await request(app)
        .get(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toHaveProperty("passwordHash");
      expect(res.body.user).not.toHaveProperty("avatarKey");
      expect(res.body.user).not.toHaveProperty("privateMetadata");
    });

    it("returns avatarUrl as null when no avatar is set", async () => {
      const res = await request(app)
        .get(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.avatarUrl).toBeNull();
    });

    it("returns streaming avatarUrl path (not S3 URL) when avatar is set", async () => {
      // Set avatarKey directly in DB to simulate having an avatar
      const { User } = require("../../../app/models/schema/user.schema");
      await User.findByIdAndUpdate(userId, { avatarKey: "avatars/users/test.jpg" });

      const res = await request(app)
        .get(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      const url = res.body.user.avatarUrl as string;
      expect(url).toMatch(/^\/api\/v1\/auth\/avatar\//);
      expect(url).not.toContain("amazonaws.com");
      expect(url).not.toContain("s3.");
    });
  });

  // ─── PATCH /auth/profile ─────────────────────────────────────────────────────
  describe("PATCH /auth/profile", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .patch(`${BASE}/profile`)
        .send({ fullName: "New Name" });
      expect(res.status).toBe(401);
    });

    it("returns 400 when no fields provided", async () => {
      const res = await request(app)
        .patch(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("returns 200 and updates fullName", async () => {
      const res = await request(app)
        .patch(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({ fullName: "Updated Name" });

      expect(res.status).toBe(200);
      expect(res.body.user.fullName).toBe("Updated Name");
    });

    it("returns 200 and updates phone", async () => {
      const res = await request(app)
        .patch(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({ phone: "+12345678901" });

      expect(res.status).toBe(200);
      expect(res.body.user.phone).toBe("+12345678901");
    });

    it("does not expose passwordHash or avatarKey after update", async () => {
      const res = await request(app)
        .patch(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({ fullName: "Safe Name" });

      expect(res.status).toBe(200);
      expect(res.body.user).not.toHaveProperty("passwordHash");
      expect(res.body.user).not.toHaveProperty("avatarKey");
    });
  });

  // ─── Health check ─────────────────────────────────────────────────────────────
  describe("GET /health", () => {
    it("returns 200 with healthy status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
    });
  });

  // ─── 404 catch-all ────────────────────────────────────────────────────────────
  describe("404 handler", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await request(app).get("/api/v1/this-does-not-exist");
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
