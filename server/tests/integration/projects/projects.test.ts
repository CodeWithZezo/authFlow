// tests/integration/projects/projects.test.ts
// Tests project CRUD + project member management endpoints.

import request from "supertest";
import app     from "../../helpers/app";
import {
  createUser, createOrg, createProject,
  addOrgMember, addProjectMember, authCookiesForUser,
} from "../../helpers/factories";
import { Role, Status } from "../../../src/models/enums";

const BASE = (orgId: string) => `/api/v1/organizations/${orgId}/projects`;

// ─── POST /organizations/:orgId/projects ─────────────────────────────────────
describe("POST /api/v1/organizations/:orgId/projects", () => {
  it("creates a project and auto-assigns creator as manager — returns 201", async () => {
    const { user } = await createUser({ email: "projcreate@example.com" });
    const org = await createOrg({ ownerUserId: user._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .post(BASE(org._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ name: "My App", description: "A test project" });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe("My App");
    expect(res.body.project.status).toBe(Status.ACTIVE);
  });

  it("returns 400 when name is missing", async () => {
    const { user } = await createUser({ email: "projnoname@example.com" });
    const org = await createOrg({ ownerUserId: user._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .post(BASE(org._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ description: "No name" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name is required/i);
  });

  it("returns 409 when project name already exists in the org", async () => {
    const { user } = await createUser({ email: "projdupe@example.com" });
    const org = await createOrg({ ownerUserId: user._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    await request(app)
      .post(BASE(org._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ name: "Duplicate" });

    const res = await request(app)
      .post(BASE(org._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ name: "Duplicate" });

    expect(res.status).toBe(409);
  });

  it("returns 403 when a plain member (not admin) tries to create a project", async () => {
    const owner  = await createUser({ email: "proj-owner@example.com" });
    const member = await createUser({ email: "proj-member@example.com" });
    const org    = await createOrg({ ownerUserId: owner.user._id });
    await addOrgMember(org._id, member.user._id, Role.MEMBER);
    const { cookieHeader } = await authCookiesForUser(member.user._id, member.user.email);

    const res = await request(app)
      .post(BASE(org._id.toString()))
      .set("Cookie", cookieHeader)
      .send({ name: "Blocked Project" });

    expect(res.status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    const { user } = await createUser({ email: "projnoauth@example.com" });
    const org = await createOrg({ ownerUserId: user._id });

    const res = await request(app)
      .post(BASE(org._id.toString()))
      .send({ name: "No Auth" });

    expect(res.status).toBe(401);
  });
});

// ─── GET /organizations/:orgId/projects ───────────────────────────────────────
describe("GET /api/v1/organizations/:orgId/projects", () => {
  it("returns all projects in the org for a member", async () => {
    const { user } = await createUser({ email: "projlist@example.com" });
    const org = await createOrg({ ownerUserId: user._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    await createProject({ organizationId: org._id, name: "Alpha" });
    await createProject({ organizationId: org._id, name: "Beta" });

    const res = await request(app)
      .get(BASE(org._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(res.body.projects.length).toBe(2);
  });

  it("returns an empty array when the org has no projects", async () => {
    const { user } = await createUser({ email: "projempty@example.com" });
    const org = await createOrg({ ownerUserId: user._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get(BASE(org._id.toString()))
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.projects).toHaveLength(0);
  });
});

// ─── GET /organizations/:orgId/projects/:projectId ────────────────────────────
describe("GET /api/v1/organizations/:orgId/projects/:projectId", () => {
  it("returns 200 with project details for an org member", async () => {
    const { user } = await createUser({ email: "projget@example.com" });
    const org     = await createOrg({ ownerUserId: user._id });
    const project = await createProject({ organizationId: org._id, name: "GetMe" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get(`${BASE(org._id.toString())}/${project._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe("GetMe");
  });

  it("returns 404 for a project that does not exist in the org", async () => {
    const { user } = await createUser({ email: "projnotfound@example.com" });
    const org = await createOrg({ ownerUserId: user._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get(`${BASE(org._id.toString())}/000000000000000000000000`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(404);
  });
});

// ─── PATCH /organizations/:orgId/projects/:projectId ──────────────────────────
describe("PATCH /api/v1/organizations/:orgId/projects/:projectId", () => {
  it("updates project name and status — returns 200", async () => {
    const { user } = await createUser({ email: "projpatch@example.com" });
    const org     = await createOrg({ ownerUserId: user._id });
    const project = await createProject({ organizationId: org._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .patch(`${BASE(org._id.toString())}/${project._id}`)
      .set("Cookie", cookieHeader)
      .send({ name: "Updated Name", status: Status.INACTIVE });

    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe("Updated Name");
    expect(res.body.project.status).toBe(Status.INACTIVE);
  });
});

// ─── DELETE /organizations/:orgId/projects/:projectId ─────────────────────────
describe("DELETE /api/v1/organizations/:orgId/projects/:projectId", () => {
  it("deletes the project for the org owner — returns 200", async () => {
    const { user } = await createUser({ email: "projdelete@example.com" });
    const org     = await createOrg({ ownerUserId: user._id });
    const project = await createProject({ organizationId: org._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .delete(`${BASE(org._id.toString())}/${project._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
  });

  it("returns 403 when an admin tries to delete (owner required)", async () => {
    const owner = await createUser({ email: "delproj-owner@example.com" });
    const admin = await createUser({ email: "delproj-admin@example.com" });
    const org   = await createOrg({ ownerUserId: owner.user._id });
    await addOrgMember(org._id, admin.user._id, Role.ADMIN);
    const project = await createProject({ organizationId: org._id });
    const { cookieHeader } = await authCookiesForUser(admin.user._id, admin.user.email);

    const res = await request(app)
      .delete(`${BASE(org._id.toString())}/${project._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(403);
  });
});

// ─── Project Members ──────────────────────────────────────────────────────────
describe("Project member endpoints", () => {
  it("POST members — adds a user and returns 201 with the membership", async () => {
    const owner  = await createUser({ email: "pm-owner@example.com" });
    const viewer = await createUser({ email: "pm-viewer@example.com" });
    const org    = await createOrg({ ownerUserId: owner.user._id });
    const project = await createProject({
      organizationId: org._id, managerUserId: owner.user._id,
    });
    const { cookieHeader } = await authCookiesForUser(owner.user._id, owner.user.email);

    const res = await request(app)
      .post(`${BASE(org._id.toString())}/${project._id}/members`)
      .set("Cookie", cookieHeader)
      .send({ userId: viewer.user._id.toString(), role: Role.VIEWER });

    expect(res.status).toBe(201);
    expect(res.body.membership.role).toBe(Role.VIEWER);
  });

  it("GET members — lists all project members", async () => {
    const owner  = await createUser({ email: "pm-list-owner@example.com" });
    const extra  = await createUser({ email: "pm-list-extra@example.com" });
    const org    = await createOrg({ ownerUserId: owner.user._id });
    const project = await createProject({
      organizationId: org._id, managerUserId: owner.user._id,
    });
    await addProjectMember(project._id, extra.user._id, Role.CONTRIBUTOR);
    const { cookieHeader } = await authCookiesForUser(owner.user._id, owner.user.email);

    const res = await request(app)
      .get(`${BASE(org._id.toString())}/${project._id}/members`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.members.length).toBeGreaterThanOrEqual(2);
  });

  it("POST members — returns 409 when user is already a member", async () => {
    const owner  = await createUser({ email: "pm-dup-owner@example.com" });
    const dupUser = await createUser({ email: "pm-dup@example.com" });
    const org    = await createOrg({ ownerUserId: owner.user._id });
    const project = await createProject({
      organizationId: org._id, managerUserId: owner.user._id,
    });
    await addProjectMember(project._id, dupUser.user._id, Role.VIEWER);
    const { cookieHeader } = await authCookiesForUser(owner.user._id, owner.user.email);

    const res = await request(app)
      .post(`${BASE(org._id.toString())}/${project._id}/members`)
      .set("Cookie", cookieHeader)
      .send({ userId: dupUser.user._id.toString(), role: Role.VIEWER });

    expect(res.status).toBe(409);
  });
});
