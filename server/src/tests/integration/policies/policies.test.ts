import request from "supertest";
import app from "../../../app";
import {
  createVerifiedUser,
  createTestOrg,
  createTestProject,
  createTestPasswordPolicy,
  createTestProjectPolicy,
  fakeId,
} from "../../helpers/testFactories";

describe("Policies Integration", () => {
  let ownerToken: string;
  let ownerUserId: string;
  let projectId: string;

  beforeEach(async () => {
    const { user, accessToken } = await createVerifiedUser();
    ownerToken = accessToken;
    ownerUserId = user._id.toString();
    const org = await createTestOrg(ownerUserId);
    const project = await createTestProject(org._id.toString(), ownerUserId);
    projectId = project._id.toString();
  });

  // ─── Password Policy ────────────────────────────────────────────────────────
  describe("Password Policy /api/v1/projects/:projectId/password-policy", () => {
    const base = (pid: string) => `/api/v1/projects/${pid}/password-policy`;

    it("POST returns 201 and creates password policy", async () => {
      const res = await request(app)
        .post(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ minLength: 8, requireNumbers: true, requireUppercase: false });

      expect(res.status).toBe(201);
      expect(res.body.passwordPolicy.projectId).toBe(projectId);
      expect(res.body.passwordPolicy.minLength).toBe(8);
    });

    it("POST returns 409 on duplicate", async () => {
      await createTestPasswordPolicy(projectId);

      const res = await request(app)
        .post(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ minLength: 6 });

      expect(res.status).toBe(409);
    });

    it("POST returns 404 for unknown project", async () => {
      const res = await request(app)
        .post(base(fakeId()))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ minLength: 6 });

      expect(res.status).toBe(404);
    });

    it("GET returns 200 with existing policy", async () => {
      await createTestPasswordPolicy(projectId);

      const res = await request(app)
        .get(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.passwordPolicy.projectId).toBe(projectId);
    });

    it("GET returns 404 when no policy exists", async () => {
      const res = await request(app)
        .get(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("PATCH returns 200 on valid update", async () => {
      await createTestPasswordPolicy(projectId);

      const res = await request(app)
        .patch(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ minLength: 10, requireNumbers: true });

      expect(res.status).toBe(200);
      expect(res.body.passwordPolicy.minLength).toBe(10);
    });

    it("PATCH returns 400 when minLength < 4", async () => {
      await createTestPasswordPolicy(projectId);

      const res = await request(app)
        .patch(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ minLength: 3 });

      expect(res.status).toBe(400);
    });

    it("DELETE returns 400 when project policy still references it", async () => {
      const pp = await createTestPasswordPolicy(projectId);
      await createTestProjectPolicy(projectId, pp._id.toString());

      const res = await request(app)
        .delete(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(400);
    });

    it("DELETE returns 200 when no project policy references it", async () => {
      await createTestPasswordPolicy(projectId);

      const res = await request(app)
        .delete(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ─── Project Policy ─────────────────────────────────────────────────────────
  describe("Project Policy /api/v1/projects/:projectId/policy", () => {
    const base = (pid: string) => `/api/v1/projects/${pid}/policy`;

    it("POST returns 400 when no password policy exists yet", async () => {
      const res = await request(app)
        .post(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ authType: "password", authMethods: ["email"] });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/password policy/i);
    });

    it("POST returns 201 after password policy is created", async () => {
      const pp = await createTestPasswordPolicy(projectId);

      const res = await request(app)
        .post(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({
          authType: "password",
          authMethods: ["email"],
          roles: ["user"],
          statuses: ["active"],
        });

      expect(res.status).toBe(201);
      expect(res.body.policy.projectId).toBe(projectId);
    });

    it("POST returns 409 on duplicate policy", async () => {
      const pp = await createTestPasswordPolicy(projectId);
      await createTestProjectPolicy(projectId, pp._id.toString());

      const res = await request(app)
        .post(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ authType: "password" });

      expect(res.status).toBe(409);
    });

    it("GET returns 200 with existing policy and populated password policy", async () => {
      const pp = await createTestPasswordPolicy(projectId);
      await createTestProjectPolicy(projectId, pp._id.toString());

      const res = await request(app)
        .get(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.policy.projectId).toBe(projectId);
    });

    it("PATCH returns 200 on valid update", async () => {
      const pp = await createTestPasswordPolicy(projectId);
      await createTestProjectPolicy(projectId, pp._id.toString());

      const res = await request(app)
        .patch(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`)
        .send({ phoneRequired: true });

      expect(res.status).toBe(200);
    });

    it("DELETE returns 200 and removes project policy", async () => {
      const pp = await createTestPasswordPolicy(projectId);
      await createTestProjectPolicy(projectId, pp._id.toString());

      const res = await request(app)
        .delete(base(projectId))
        .set("Cookie", `accessToken=${ownerToken}`);

      expect(res.status).toBe(200);
    });
  });
});
