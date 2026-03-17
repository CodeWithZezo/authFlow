// tests/integration/policies/passwordPolicy.test.ts
// Tests /api/v1/projects/:projectId/password-policy CRUD.

import request from "supertest";
import app     from "../../helpers/app";
import {
  createUser, createOrg, createProject,
  createPasswordPolicy, createProjectPolicy,
  addProjectMember, authCookiesForUser,
} from "../../helpers/factories";
import { Role } from "../../../src/models/enums";

const BASE = (projectId: string) => `/api/v1/projects/${projectId}/password-policy`;

async function setupProject(email: string) {
  const { user } = await createUser({ email });
  const org     = await createOrg({ ownerUserId: user._id });
  const project = await createProject({
    organizationId: org._id,
    managerUserId:  user._id,
  });
  const { cookieHeader } = await authCookiesForUser(user._id, user.email);
  return { user, org, project, cookieHeader };
}

// ─── POST ─────────────────────────────────────────────────────────────────────
describe("POST /api/v1/projects/:projectId/password-policy", () => {
  it("creates a password policy with provided values — returns 201", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-create@example.com");

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({
        minLength:           10,
        requireNumbers:      true,
        requireUppercase:    true,
        requireSpecialChars: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.passwordPolicy.minLength).toBe(10);
    expect(res.body.passwordPolicy.requireSpecialChars).toBe(true);
    expect(res.body.passwordPolicy.projectId.toString()).toBe(project._id.toString());
  });

  it("creates with defaults when no body fields are given", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-defaults@example.com");

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body.passwordPolicy.minLength).toBe(6);
    expect(res.body.passwordPolicy.requireNumbers).toBe(true);
    expect(res.body.passwordPolicy.requireUppercase).toBe(true);
    expect(res.body.passwordPolicy.requireSpecialChars).toBe(false);
  });

  it("returns 409 when a policy already exists for the project", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-dupe@example.com");
    await createPasswordPolicy(project._id);

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ minLength: 8 });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("returns 404 when the project does not exist", async () => {
    const { user } = await createUser({ email: "pwdpol-noproject@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .post("/api/v1/projects/000000000000000000000000/password-policy")
      .set("Cookie", cookieHeader)
      .send({ minLength: 8 });

    expect(res.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    const { project } = await setupProject("pwdpol-noauth@example.com");

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .send({ minLength: 8 });

    expect(res.status).toBe(401);
  });
});

// ─── GET ──────────────────────────────────────────────────────────────────────
describe("GET /api/v1/projects/:projectId/password-policy", () => {
  it("returns 200 with the policy for a project member", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-get@example.com");
    await createPasswordPolicy(project._id, { minLength: 12 });

    const res = await request(app)
      .get(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.passwordPolicy.minLength).toBe(12);
  });

  it("returns 404 when no policy exists", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-getmissing@example.com");

    const res = await request(app)
      .get(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// ─── PATCH ────────────────────────────────────────────────────────────────────
describe("PATCH /api/v1/projects/:projectId/password-policy", () => {
  it("updates the policy fields — returns 200", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-patch@example.com");
    await createPasswordPolicy(project._id, { minLength: 6 });

    const res = await request(app)
      .patch(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ minLength: 14, requireSpecialChars: true });

    expect(res.status).toBe(200);
    expect(res.body.passwordPolicy.minLength).toBe(14);
    expect(res.body.passwordPolicy.requireSpecialChars).toBe(true);
  });

  it("returns 400 when no fields are provided", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-patchempty@example.com");
    await createPasswordPolicy(project._id);

    const res = await request(app)
      .patch(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least one field/i);
  });

  it("returns 400 when minLength is below 4", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-minlen@example.com");
    await createPasswordPolicy(project._id);

    const res = await request(app)
      .patch(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ minLength: 2 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/less than 4/i);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────
describe("DELETE /api/v1/projects/:projectId/password-policy", () => {
  it("deletes the policy when no ProjectPolicy references it", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-delete@example.com");
    await createPasswordPolicy(project._id);

    const res = await request(app)
      .delete(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("returns 400 when a ProjectPolicy still references the password policy", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-deleteblocked@example.com");
    const pwdPolicy = await createPasswordPolicy(project._id);
    await createProjectPolicy(project._id, pwdPolicy._id);

    const res = await request(app)
      .delete(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/project policy/i);
  });

  it("returns 404 when no policy exists", async () => {
    const { project, cookieHeader } = await setupProject("pwdpol-deletenone@example.com");

    const res = await request(app)
      .delete(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(404);
  });
});
