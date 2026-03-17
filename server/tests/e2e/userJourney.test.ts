// tests/e2e/userJourney.test.ts
// Full end-to-end user journey — no factories, no mocks.
// Every step calls the real API the way a real client would.
//
// Journey:
//   1.  Signup
//   2.  Login
//   3.  GET /auth/me
//   4.  Create organization
//   5.  Verify creator is owner (GET members)
//   6.  Add a second user
//   7.  Create a project
//   8.  Verify creator is project manager
//   9.  Create password policy
//   10. Create project policy (references password policy)
//   11. GET project policy — confirm passwordPolicyId is populated
//   12. Attempt to delete password policy while project policy exists → 400
//   13. Delete project policy
//   14. Delete password policy
//   15. Add a project member (second user as viewer)
//   16. Update project member role to contributor
//   17. Remove project member
//   18. Change password
//   19. Login with new password
//   20. Revoke all sessions

import request from "supertest";
import app     from "../helpers/app";
import { AuthMethod, AuthType } from "../../src/models/enums";

describe("End-to-end: full user journey", () => {
  // Shared state across steps — populated as the journey progresses
  let cookieHeader = "";
  let userId       = "";
  let orgId        = "";
  let projectId    = "";
  let secondUserId = "";

  const user = {
    fullName: "Alice Founder",
    email:    `alice-${Date.now()}@e2e.test`,
    password: "AlicePass1!",
  };

  const secondUser = {
    fullName: "Bob Viewer",
    email:    `bob-${Date.now()}@e2e.test`,
    password: "BobPass1!",
  };

  // ── Step 1: Signup ──────────────────────────────────────────────────────────
  it("1. signs up successfully", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(user);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(user.email);
    userId = res.body.user.id;

    const cookies = res.headers["set-cookie"] as unknown as string[];
    cookieHeader = cookies.join("; ");
    expect(cookieHeader).toContain("accessToken");
  });

  // ── Step 2: Login ───────────────────────────────────────────────────────────
  it("2. logs in and receives fresh cookies", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    cookieHeader = cookies.join("; ");
    expect(cookieHeader).toContain("refreshToken");
  });

  // ── Step 3: GET /auth/me ────────────────────────────────────────────────────
  it("3. fetches own profile with GET /auth/me", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  // ── Step 4: Create organization ─────────────────────────────────────────────
  it("4. creates an organization", async () => {
    const res = await request(app)
      .post("/api/v1/organizations")
      .set("Cookie", cookieHeader)
      .send({ name: "E2E Corp", slug: `e2e-corp-${Date.now()}` });

    expect(res.status).toBe(201);
    orgId = res.body.org._id;
    expect(orgId).toBeDefined();
  });

  // ── Step 5: Creator is owner ────────────────────────────────────────────────
  it("5. creator is auto-assigned as owner of the org", async () => {
    const res = await request(app)
      .get(`/api/v1/organizations/${orgId}/members`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    const me = res.body.members.find((m: any) => {
      const uid = typeof m.userId === "object" ? m.userId._id : m.userId;
      return uid.toString() === userId;
    });
    expect(me).toBeDefined();
    expect(me.role).toBe("owner");
  });

  // ── Step 6: Sign up a second user ───────────────────────────────────────────
  it("6. signs up a second user", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send(secondUser);

    expect(res.status).toBe(201);
    secondUserId = res.body.user.id;
    expect(secondUserId).toBeDefined();
  });

  // ── Step 7: Create a project ────────────────────────────────────────────────
  it("7. creates a project inside the organization", async () => {
    const res = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects`)
      .set("Cookie", cookieHeader)
      .send({ name: "E2E Project", description: "Full journey test" });

    expect(res.status).toBe(201);
    projectId = res.body.project._id;
    expect(projectId).toBeDefined();
    expect(res.body.project.status).toBe("active");
  });

  // ── Step 8: Creator is project manager ──────────────────────────────────────
  it("8. creator is auto-assigned as project manager", async () => {
    const res = await request(app)
      .get(`/api/v1/organizations/${orgId}/projects/${projectId}/members`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    const me = res.body.members.find((m: any) => {
      const uid = typeof m.userId === "object" ? m.userId._id : m.userId;
      return uid.toString() === userId;
    });
    expect(me).toBeDefined();
    expect(me.role).toBe("manager");
  });

  // ── Step 9: Create password policy ──────────────────────────────────────────
  it("9. creates a password policy for the project", async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/password-policy`)
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
  });

  // ── Step 10: Create project policy ──────────────────────────────────────────
  it("10. creates a project policy (requires password policy to exist first)", async () => {
    const res = await request(app)
      .post(`/api/v1/projects/${projectId}/policy`)
      .set("Cookie", cookieHeader)
      .send({
        authRequired:  true,
        phoneRequired: false,
        authType:      AuthType.PASSWORD,
        authMethods:   [AuthMethod.EMAIL, AuthMethod.GOOGLE],
        roles:         ["viewer", "contributor"],
        statuses:      ["active"],
      });

    expect(res.status).toBe(201);
    expect(res.body.policy.authMethods).toContain(AuthMethod.EMAIL);
    expect(res.body.policy.passwordPolicyId).toBeDefined();
  });

  // ── Step 11: GET policy — passwordPolicyId is populated ─────────────────────
  it("11. GET project policy returns a populated passwordPolicyId object", async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/policy`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(typeof res.body.policy.passwordPolicyId).toBe("object");
    expect(res.body.policy.passwordPolicyId.minLength).toBe(10);
  });

  // ── Step 12: Block deletion while project policy references it ───────────────
  it("12. cannot delete password policy while project policy exists — returns 400", async () => {
    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}/password-policy`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/project policy/i);
  });

  // ── Step 13: Delete project policy first ────────────────────────────────────
  it("13. deletes the project policy successfully", async () => {
    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}/policy`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
  });

  // ── Step 14: Now delete password policy ─────────────────────────────────────
  it("14. deletes the password policy after project policy is gone", async () => {
    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}/password-policy`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  // ── Step 15: Add second user to project ─────────────────────────────────────
  it("15. adds the second user as a project viewer", async () => {
    const res = await request(app)
      .post(`/api/v1/organizations/${orgId}/projects/${projectId}/members`)
      .set("Cookie", cookieHeader)
      .send({ userId: secondUserId, role: "viewer" });

    expect(res.status).toBe(201);
    expect(res.body.membership.role).toBe("viewer");
  });

  // ── Step 16: Update project member role ─────────────────────────────────────
  it("16. updates the second user's project role to contributor", async () => {
    const res = await request(app)
      .patch(`/api/v1/organizations/${orgId}/projects/${projectId}/members/${secondUserId}`)
      .set("Cookie", cookieHeader)
      .send({ role: "contributor" });

    expect(res.status).toBe(200);
    expect(res.body.membership.role).toBe("contributor");
  });

  // ── Step 17: Remove project member ──────────────────────────────────────────
  it("17. removes the second user from the project", async () => {
    const res = await request(app)
      .delete(`/api/v1/organizations/${orgId}/projects/${projectId}/members/${secondUserId}`)
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
  });

  // ── Step 18: Change password ─────────────────────────────────────────────────
  it("18. changes the user password", async () => {
    const res = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({ currentPassword: user.password, newPassword: "AliceNewPass2!" });

    expect(res.status).toBe(200);
  });

  // ── Step 19: Login with new password ────────────────────────────────────────
  it("19. can login with the new password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: "AliceNewPass2!" });

    expect(res.status).toBe(200);
    const cookies = res.headers["set-cookie"] as unknown as string[];
    cookieHeader = cookies.join("; ");
  });

  // ── Step 20: Revoke all sessions ─────────────────────────────────────────────
  it("20. revokes all sessions", async () => {
    const res = await request(app)
      .delete("/api/v1/sessions")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.revokedCount).toBeGreaterThanOrEqual(1);
  });
});
