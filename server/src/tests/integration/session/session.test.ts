import request from "supertest";
import app from "../../../app";
import { createVerifiedUser } from "../../helpers/testFactories";
import { Session } from "../../../app/models/schema/session.schema";
import mongoose from "mongoose";

const BASE = "/api/v1/sessions";

describe("Sessions Integration", () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeEach(async () => {
    const result = await createVerifiedUser();
    accessToken = result.accessToken;
    refreshToken = result.refreshToken;
    userId = result.user._id.toString();
  });

  // ─── GET /sessions ──────────────────────────────────────────────────────────
  describe("GET /sessions", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(401);
    });

    it("returns 200 with sessions list", async () => {
      const res = await request(app)
        .get(BASE)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it("does not expose refreshToken in sessions list", async () => {
      const res = await request(app)
        .get(BASE)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      res.body.sessions.forEach((s: any) => {
        expect(s).not.toHaveProperty("refreshToken");
      });
    });
  });

  // ─── DELETE /sessions/:sessionId ────────────────────────────────────────────
  describe("DELETE /sessions/:sessionId", () => {
    it("returns 404 for unknown session", async () => {
      const res = await request(app)
        .delete(`${BASE}/${new mongoose.Types.ObjectId().toString()}`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(404);
    });

    it("returns 200 and revokes the session", async () => {
      const session = await Session.findOne({ userId });
      expect(session).not.toBeNull();

      const res = await request(app)
        .delete(`${BASE}/${session!._id.toString()}`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);

      const deleted = await Session.findById(session!._id);
      expect(deleted).toBeNull();
    });

    it("prevents revoking another user's session", async () => {
      const { accessToken: otherToken } = await createVerifiedUser();
      // Get the current user's session
      const mySession = await Session.findOne({ userId });

      const res = await request(app)
        .delete(`${BASE}/${mySession!._id.toString()}`)
        .set("Cookie", `accessToken=${otherToken}`);

      // Should return 404 because the session belongs to a different user
      expect(res.status).toBe(404);

      // Session should still exist
      const stillExists = await Session.findById(mySession!._id);
      expect(stillExists).not.toBeNull();
    });
  });

  // ─── DELETE /sessions (revoke all) ──────────────────────────────────────────
  describe("DELETE /sessions", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app).delete(BASE);
      expect(res.status).toBe(401);
    });

    it("returns 200 and deletes all sessions for current user", async () => {
      // Create extra sessions for the same user
      await Session.create({ userId, refreshToken: "extra_rt_1" });
      await Session.create({ userId, refreshToken: "extra_rt_2" });

      const beforeCount = await Session.countDocuments({ userId });
      expect(beforeCount).toBeGreaterThanOrEqual(3);

      const res = await request(app)
        .delete(BASE)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.revokedCount).toBeGreaterThanOrEqual(3);

      const afterCount = await Session.countDocuments({ userId });
      expect(afterCount).toBe(0);
    });

    it("does not affect other users sessions", async () => {
      const { user: other, accessToken: otherToken } = await createVerifiedUser();
      const otherSession = await Session.findOne({ userId: other._id });

      await request(app)
        .delete(BASE)
        .set("Cookie", `accessToken=${accessToken}`);

      const stillThere = await Session.findById(otherSession!._id);
      expect(stillThere).not.toBeNull();
    });
  });
});
