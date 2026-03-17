// tests/integration/orgs/orgs.test.ts
// Tests organization CRUD + member management endpoints.

import request from "supertest";
import app     from "../../helpers/app";
import {
  createUser, createOrg, addOrgMember, authCookiesForUser,
} from "../../helpers/factories";
import { Role, Status } from "../../../src/models/enums";

// ─── POST /organizations ───────────────────────────────────────────────────────
describe("POST /api/v1/organizations", () => {
  it("creates an org and auto-assigns the caller as owner — returns 201", async () => {
    const { user } = await createUser({ email: "orgcreator@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .post("/api/v1/organizations")
      .set("Cookie", cookieHeader)
      .send({ name: "Acme Corp", slug: "acme-corp" });

    expect(res.status).toBe(201);
    expect(res.body.org.name).toBe("Acme Corp");
    expect(res.body.org.slug).toBe("acme-corp");
  });

  it("returns 400 when name is missing", async () => {
    const { user } = await createUser({ email: "missingname@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .post("/api/v1/organizations")
      .set("Cookie", cookieHeader)
      .send({ slug: "no-name" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when slug is missing", async () => {
    const { user } = await createUser({ email: "missingslug@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .post("/api/v1/organizations")
      .set("Cookie", cookieHeader)
      .send({ name: "No Slug" });

    expect(res.status).toBe(400);
  });

  it("returns 409 when the slug is already taken", async () => {
    const { user } = await createUser({ email: "slugdupe@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    await request(app)
      .post("/api/v1/organizations")
      .set("Cookie", cookieHeader)
      .send({ name: "First", slug: "duplicate-slug" });

    const res = await request(app)
      .post("/api/v1/organizations")
      .set("Cookie", cookieHeader)
      .send({ name: "Second", slug: "duplicate-slug" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/slug already exists/i);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/v1/organizations")
      .send({ name: "No Auth Org", slug: "no-auth-org" });

    expect(res.status).toBe(401);
  });
});

// ─── GET /organizations/:orgId ────────────────────────────────────────────────
describe("GET /api/v1/organizations/:orgId", () => {
  it("returns 200 with the org for a member", async () => {
    const { user } = await createUser({ email: "orgget@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);
    const org = await createOrg({ ownerUserId: user._id });

    const res = await request(app)
      .get(`/api/v1/organizations/${org._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.org._id.toString()).toBe(org._id.toString());
  });

  it("returns 403 when the caller is not a member", async () => {
    const owner   = await createUser({ email: "orgowner@example.com" });
    const outsider = await createUser({ email: "outsider@example.com" });
    const org = await createOrg({ ownerUserId: owner.user._id });
    const { cookieHeader } = await authCookiesForUser(outsider.user._id, outsider.user.email);

    const res = await request(app)
      .get(`/api/v1/organizations/${org._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(403);
  });

  it("returns 404 for a non-existent org id", async () => {
    const { user } = await createUser({ email: "orgnone@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .get("/api/v1/organizations/000000000000000000000000")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(403); // not a member of a non-existent org
  });
});

// ─── PATCH /organizations/:orgId ──────────────────────────────────────────────
describe("PATCH /api/v1/organizations/:orgId", () => {
  it("returns 200 and updates name/slug for an admin", async () => {
    const { user } = await createUser({ email: "orgpatch@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);
    const org = await createOrg({ ownerUserId: user._id, slug: "patch-me-old" });

    const res = await request(app)
      .patch(`/api/v1/organizations/${org._id}`)
      .set("Cookie", cookieHeader)
      .send({ name: "Updated Name", slug: "patch-me-new" });

    expect(res.status).toBe(200);
    expect(res.body.org.name).toBe("Updated Name");
    expect(res.body.org.slug).toBe("patch-me-new");
  });

  it("returns 403 when a plain member tries to update the org", async () => {
    const owner  = await createUser({ email: "patchowner@example.com" });
    const member = await createUser({ email: "patchmember@example.com" });
    const org = await createOrg({ ownerUserId: owner.user._id });
    await addOrgMember(org._id, member.user._id, Role.MEMBER);
    const { cookieHeader } = await authCookiesForUser(member.user._id, member.user.email);

    const res = await request(app)
      .patch(`/api/v1/organizations/${org._id}`)
      .set("Cookie", cookieHeader)
      .send({ name: "Hacked Name" });

    expect(res.status).toBe(403);
  });
});

// ─── DELETE /organizations/:orgId ─────────────────────────────────────────────
describe("DELETE /api/v1/organizations/:orgId", () => {
  it("returns 200 and deletes the org for the owner", async () => {
    const { user } = await createUser({ email: "orgdelete@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);
    const org = await createOrg({ ownerUserId: user._id });

    const res = await request(app)
      .delete(`/api/v1/organizations/${org._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("returns 403 when an admin (not owner) tries to delete", async () => {
    const owner = await createUser({ email: "delowner@example.com" });
    const admin = await createUser({ email: "deladmin@example.com" });
    const org   = await createOrg({ ownerUserId: owner.user._id });
    await addOrgMember(org._id, admin.user._id, Role.ADMIN);
    const { cookieHeader } = await authCookiesForUser(admin.user._id, admin.user.email);

    const res = await request(app)
      .delete(`/api/v1/organizations/${org._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(403);
  });
});

// ─── GET /organizations/:orgId/members ────────────────────────────────────────
describe("GET /api/v1/organizations/:orgId/members", () => {
  it("returns a members array for any member of the org", async () => {
    const { user } = await createUser({ email: "memberslist@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);
    const org = await createOrg({ ownerUserId: user._id });

    const extra = await createUser({ email: "extra@example.com" });
    await addOrgMember(org._id, extra.user._id, Role.MEMBER);

    const res = await request(app)
      .get(`/api/v1/organizations/${org._id}/members`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.members)).toBe(true);
    expect(res.body.members.length).toBe(2);
  });
});

// ─── POST /organizations/:orgId/members ──────────────────────────────────────
describe("POST /api/v1/organizations/:orgId/members", () => {
  it("adds a member and returns 201 with the membership", async () => {
    const owner  = await createUser({ email: "addmember-owner@example.com" });
    const newbie = await createUser({ email: "newbie@example.com" });
    const org    = await createOrg({ ownerUserId: owner.user._id });
    const { cookieHeader } = await authCookiesForUser(owner.user._id, owner.user.email);

    const res = await request(app)
      .post(`/api/v1/organizations/${org._id}/members`)
      .set("Cookie", cookieHeader)
      .send({ userId: newbie.user._id.toString(), role: Role.MEMBER });

    expect(res.status).toBe(201);
    expect(res.body.membership.role).toBe(Role.MEMBER);
  });

  it("returns 409 when the user is already a member", async () => {
    const owner = await createUser({ email: "dupmember-owner@example.com" });
    const dupe  = await createUser({ email: "dupe@example.com" });
    const org   = await createOrg({ ownerUserId: owner.user._id });
    await addOrgMember(org._id, dupe.user._id, Role.MEMBER);
    const { cookieHeader } = await authCookiesForUser(owner.user._id, owner.user.email);

    const res = await request(app)
      .post(`/api/v1/organizations/${org._id}/members`)
      .set("Cookie", cookieHeader)
      .send({ userId: dupe.user._id.toString() });

    expect(res.status).toBe(409);
  });
});

// ─── DELETE /organizations/:orgId/members/:userId ─────────────────────────────
describe("DELETE /api/v1/organizations/:orgId/members/:userId", () => {
  it("returns 400 when attempting to remove the last owner", async () => {
    const { user } = await createUser({ email: "lastowner@example.com" });
    const org = await createOrg({ ownerUserId: user._id });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .delete(`/api/v1/organizations/${org._id}/members/${user._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/last owner/i);
  });

  it("removes a member successfully", async () => {
    const owner  = await createUser({ email: "removeme-owner@example.com" });
    const member = await createUser({ email: "removeme@example.com" });
    const org    = await createOrg({ ownerUserId: owner.user._id });
    await addOrgMember(org._id, member.user._id, Role.MEMBER);
    const { cookieHeader } = await authCookiesForUser(owner.user._id, owner.user.email);

    const res = await request(app)
      .delete(`/api/v1/organizations/${org._id}/members/${member.user._id}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
  });
});
