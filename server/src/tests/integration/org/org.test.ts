import request from "supertest";
import app from "../../../app";
import {
  createVerifiedUser,
  createTestOrg,
  createTestUser,
  fakeId,
} from "../../helpers/testFactories";
import { OrganizationMembership } from "../../../app/models/schema/organizationMembership.schema";
import { Role, Status } from "../../../app/models/enums";

const BASE = "/api/v1/organizations";

describe("Org Integration", () => {
  let ownerToken: string;
  let ownerUserId: string;
  let orgId: string;

  beforeEach(async () => {
    const { user, accessToken } = await createVerifiedUser();
    ownerToken = accessToken;
    ownerUserId = user._id.toString();
    const org = await createTestOrg(ownerUserId);
    orgId = org._id.toString();
  });

  // ─── POST /organizations ────────────────────────────────────────────────────
  describe("POST /organizations", () => {
    it("returns 201 and creates org for verified user", async () => {
      const res = await request(app)
        .post(BASE)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name: "New Org", slug: `new-org-${Date.now()}` });

      expect(res.status).toBe(201);
      expect(res.body.org.name).toBe("New Org");
    });

    it("returns 403 for unverified user", async () => {
      const { user: unverified } = await createTestUser({ email: `unv_${Date.now()}@test.com` });
      const { JWTUtils } = require("../../../app/utils/jwt.utils");
      const token = JWTUtils.generateAccessToken({ userId: unverified._id.toString(), email: unverified.email });

      const res = await request(app)
        .post(BASE)
        .set("Cookie", `accessToken=${token}`)
        .send({ name: "Unverified Org", slug: `unverified-org-${Date.now()}` });

      expect(res.status).toBe(403);
    });

    it("returns 409 on duplicate slug", async () => {
      const slug = `dup-org-${Date.now()}`;
      await request(app)
        .post(BASE)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name: "First", slug });

      const res = await request(app)
        .post(BASE)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name: "Second", slug });

      expect(res.status).toBe(409);
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(app).post(BASE).send({ name: "Org", slug: "some-slug" });
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /organizations/:orgId ──────────────────────────────────────────────
  describe("GET /organizations/:orgId", () => {
    it("returns 200 with org data for member", async () => {
      const res = await request(app)
        .get(`${BASE}/${orgId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.org._id).toBe(orgId);
    });

    it("returns 403 for non-member", async () => {
      const { accessToken } = await createVerifiedUser();
      const res = await request(app)
        .get(`${BASE}/${orgId}`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(403);
    });

    // FIX: getOrg checks membership FIRST → a fake org ID returns 403 (not a member),
    // not 404. The correct assertion for a totally unknown ID is 403.
    it("returns 403 for an orgId the user is not a member of", async () => {
      const res = await request(app)
        .get(`${BASE}/${fakeId()}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── PATCH /organizations/:orgId ────────────────────────────────────────────
  describe("PATCH /organizations/:orgId", () => {
    it("returns 200 for owner updating org", async () => {
      const res = await request(app)
        .patch(`${BASE}/${orgId}`)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name: "Updated Org Name" });

      expect(res.status).toBe(200);
      expect(res.body.org.name).toBe("Updated Org Name");
    });

    it("returns 403 for plain member attempting update", async () => {
      const { user: member, accessToken: memberToken } = await createVerifiedUser();
      await OrganizationMembership.create({
        userId: member._id,
        orgId,
        role: Role.MEMBER,
        status: Status.ACTIVE,
      });

      const res = await request(app)
        .patch(`${BASE}/${orgId}`)
        .set("Cookie", `accessToken=${memberToken}`)
        .send({ name: "Hacked" });

      expect(res.status).toBe(403);
    });
  });

  // ─── DELETE /organizations/:orgId ───────────────────────────────────────────
  describe("DELETE /organizations/:orgId", () => {
    it("returns 200 and deletes org for owner", async () => {
      const res = await request(app)
        .delete(`${BASE}/${orgId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("returns 403 for admin attempting delete", async () => {
      const { user: admin, accessToken: adminToken } = await createVerifiedUser();
      await OrganizationMembership.create({
        userId: admin._id,
        orgId,
        role: Role.ADMIN,
        status: Status.ACTIVE,
      });

      const res = await request(app)
        .delete(`${BASE}/${orgId}`)
        .set("Cookie", `accessToken=${adminToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Org Members ────────────────────────────────────────────────────────────
  describe("Members", () => {
    it("POST /:orgId/members returns 201 and adds member", async () => {
      const { user: newMember } = await createTestUser({ email: `member_${Date.now()}@test.com` });

      const res = await request(app)
        .post(`${BASE}/${orgId}/members`)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ userId: newMember._id.toString() });

      expect(res.status).toBe(201);
    });

    it("GET /:orgId/members returns 200 with members list", async () => {
      const res = await request(app)
        .get(`${BASE}/${orgId}/members`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.members)).toBe(true);
    });

    it("DELETE /:orgId/members/:userId returns 400 removing last owner", async () => {
      const res = await request(app)
        .delete(`${BASE}/${orgId}/members/${ownerUserId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/last owner/i);
    });
  });
});
