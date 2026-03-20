import request from "supertest";
import app from "../../../app";
import {
  createVerifiedUser,
  createTestOrg,
  createTestProject,
  fakeId,
} from "../../helpers/testFactories";
import { ProjectMembership } from "../../../app/models/schema/projectMembership.schema";
import { Role, Status } from "../../../app/models/enums";

describe("Project Integration", () => {
  let ownerToken: string;
  let ownerUserId: string;
  let orgId: string;
  let projectId: string;

  const BASE = (oId: string) => `/api/v1/organizations/${oId}/projects`;

  beforeEach(async () => {
    const { user, accessToken } = await createVerifiedUser();
    ownerToken = accessToken;
    ownerUserId = user._id.toString();
    const org = await createTestOrg(ownerUserId);
    orgId = org._id.toString();
    const project = await createTestProject(orgId, ownerUserId);
    projectId = project._id.toString();
  });

  // ─── POST /projects ─────────────────────────────────────────────────────────
  describe("POST /:orgId/projects", () => {
    it("returns 201 and creates project for org owner", async () => {
      const res = await request(app)
        .post(BASE(orgId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name: `New Project ${Date.now()}`, description: "Desc" });

      expect(res.status).toBe(201);
      expect(res.body.project.organizationId).toBe(orgId);
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .post(BASE(orgId))
        .send({ name: "Unauthed Project" });

      expect(res.status).toBe(401);
    });

    // FIX: a user with no org membership gets 404 from roleAuthorize
    // (membership not found → 404), not 403.
    it("returns 404 for user with no org membership", async () => {
      const { accessToken: otherToken } = await createVerifiedUser();
      const res = await request(app)
        .post(BASE(orgId))
        .set("Cookie", `accessToken=${otherToken}`)
        .send({ name: "Unauthorized Project" });

      expect(res.status).toBe(404);
    });

    it("returns 409 on duplicate project name in same org", async () => {
      const name = `DupProject ${Date.now()}`;
      await request(app)
        .post(BASE(orgId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name });

      const res = await request(app)
        .post(BASE(orgId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name });

      expect(res.status).toBe(409);
    });
  });

  // ─── GET /projects ──────────────────────────────────────────────────────────
  describe("GET /:orgId/projects", () => {
    it("returns 200 with array of projects", async () => {
      const res = await request(app)
        .get(BASE(orgId))
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── GET /projects/:projectId ───────────────────────────────────────────────
  describe("GET /:orgId/projects/:projectId", () => {
    it("returns 200 with project data", async () => {
      const res = await request(app)
        .get(`${BASE(orgId)}/${projectId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.project._id).toBe(projectId);
    });

    it("returns 404 for unknown projectId", async () => {
      const res = await request(app)
        .get(`${BASE(orgId)}/${fakeId()}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── PATCH /projects/:projectId ─────────────────────────────────────────────
  describe("PATCH /:orgId/projects/:projectId", () => {
    it("returns 200 for owner updating project", async () => {
      const res = await request(app)
        .patch(`${BASE(orgId)}/${projectId}`)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ name: "Updated Project Name" });

      expect(res.status).toBe(200);
      expect(res.body.project.name).toBe("Updated Project Name");
    });
  });

  // ─── DELETE /projects/:projectId ────────────────────────────────────────────
  describe("DELETE /:orgId/projects/:projectId", () => {
    it("returns 200 and deletes project for org owner", async () => {
      const res = await request(app)
        .delete(`${BASE(orgId)}/${projectId}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ─── Project Members ─────────────────────────────────────────────────────────
  // ownerToken user has role "manager" in the project (set by createTestProject).
  // Routes now allow ["admin","owner","manager"] for mutations and all roles for reads.
  describe("Project Members", () => {
    it("POST /:projectId/members adds a member", async () => {
      const { user: newMember } = await createVerifiedUser();

      const res = await request(app)
        .post(`${BASE(orgId)}/${projectId}/members`)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ userId: newMember._id.toString(), role: Role.VIEWER });

      expect(res.status).toBe(201);
    });

    it("GET /:projectId/members returns members list", async () => {
      const res = await request(app)
        .get(`${BASE(orgId)}/${projectId}/members`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.members)).toBe(true);
    });

    it("PATCH /:projectId/members/:userId updates member", async () => {
      const { user: member } = await createVerifiedUser();
      await ProjectMembership.create({
        projectId,
        userId: member._id,
        role: Role.VIEWER,
        status: Status.ACTIVE,
      });

      const res = await request(app)
        .patch(`${BASE(orgId)}/${projectId}/members/${member._id.toString()}`)
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ role: Role.CONTRIBUTOR });

      expect(res.status).toBe(200);
    });

    it("DELETE /:projectId/members/:userId removes member", async () => {
      const { user: member } = await createVerifiedUser();
      await ProjectMembership.create({
        projectId,
        userId: member._id,
        role: Role.VIEWER,
        status: Status.ACTIVE,
      });

      const res = await request(app)
        .delete(`${BASE(orgId)}/${projectId}/members/${member._id.toString()}`)
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
    });
  });
});
