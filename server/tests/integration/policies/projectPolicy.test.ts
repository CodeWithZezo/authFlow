// tests/integration/policies/projectPolicy.test.ts
// Tests /api/v1/projects/:projectId/policy CRUD.
// Key constraint: password policy must exist before project policy can be created.

import request from "supertest";
import app     from "../../helpers/app";
import {
  createUser, createOrg, createProject,
  createPasswordPolicy, authCookiesForUser,
} from "../../helpers/factories";
import { AuthType, AuthMethod } from "../../../src/models/enums";

const BASE = (projectId: string) => `/api/v1/projects/${projectId}/policy`;

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
describe("POST /api/v1/projects/:projectId/policy", () => {
  it("returns 400 when no password policy exists for the project", async () => {
    const { project, cookieHeader } = await setupProject("ppol-nopwd@example.com");

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: true });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password policy must be created/i);
  });

  it("creates the policy when a password policy exists — returns 201", async () => {
    const { project, cookieHeader } = await setupProject("ppol-create@example.com");
    await createPasswordPolicy(project._id);

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({
        authRequired:  true,
        phoneRequired: false,
        authType:      AuthType.PASSWORD,
        authMethods:   [AuthMethod.EMAIL],
        roles:         ["viewer"],
        statuses:      ["active"],
      });

    expect(res.status).toBe(201);
    expect(res.body.policy.authRequired).toBe(true);
    expect(res.body.policy.authMethods).toContain(AuthMethod.EMAIL);
    expect(res.body.policy.passwordPolicyId).toBeDefined();
  });

  it("auto-links to the existing password policy", async () => {
    const { project, cookieHeader } = await setupProject("ppol-link@example.com");
    const pwdPolicy = await createPasswordPolicy(project._id);

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: true });

    expect(res.status).toBe(201);
    expect(res.body.policy.passwordPolicyId.toString()).toBe(pwdPolicy._id.toString());
  });

  it("returns 409 when a policy already exists for the project", async () => {
    const { project, cookieHeader } = await setupProject("ppol-dupe@example.com");
    const pwdPolicy = await createPasswordPolicy(project._id);

    await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: true });

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: true });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("returns 401 when unauthenticated", async () => {
    const { project } = await setupProject("ppol-noauth@example.com");

    const res = await request(app)
      .post(BASE(project._id.toString()))
      .send({ authRequired: true });

    expect(res.status).toBe(401);
  });
});

// ─── GET ──────────────────────────────────────────────────────────────────────
describe("GET /api/v1/projects/:projectId/policy", () => {
  it("returns 200 with the policy and populated passwordPolicyId", async () => {
    const { project, cookieHeader } = await setupProject("ppol-get@example.com");
    const pwdPolicy = await createPasswordPolicy(project._id);
    await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: false });

    const res = await request(app)
      .get(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.policy.passwordPolicyId).toBeDefined();
    // passwordPolicyId should be populated (object not just an id string)
    expect(typeof res.body.policy.passwordPolicyId).toBe("object");
  });

  it("returns 404 when no policy exists", async () => {
    const { project, cookieHeader } = await setupProject("ppol-getmissing@example.com");

    const res = await request(app)
      .get(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// ─── PATCH ────────────────────────────────────────────────────────────────────
describe("PATCH /api/v1/projects/:projectId/policy", () => {
  it("updates policy fields — returns 200", async () => {
    const { project, cookieHeader } = await setupProject("ppol-patch@example.com");
    await createPasswordPolicy(project._id);
    await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: true, phoneRequired: false });

    const res = await request(app)
      .patch(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ phoneRequired: true, authMethods: [AuthMethod.EMAIL, AuthMethod.GOOGLE] });

    expect(res.status).toBe(200);
    expect(res.body.policy.phoneRequired).toBe(true);
    expect(res.body.policy.authMethods).toContain(AuthMethod.GOOGLE);
  });

  it("returns 400 when no fields are provided", async () => {
    const { project, cookieHeader } = await setupProject("ppol-patchempty@example.com");
    await createPasswordPolicy(project._id);
    await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: true });

    const res = await request(app)
      .patch(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least one field/i);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────
describe("DELETE /api/v1/projects/:projectId/policy", () => {
  it("deletes the policy — returns 200", async () => {
    const { project, cookieHeader } = await setupProject("ppol-delete@example.com");
    await createPasswordPolicy(project._id);
    await request(app)
      .post(BASE(project._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ authRequired: true });

    const res = await request(app)
      .delete(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("returns 404 when no policy exists", async () => {
    const { project, cookieHeader } = await setupProject("ppol-deletenone@example.com");

    const res = await request(app)
      .delete(BASE(project._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(404);
  });
});
