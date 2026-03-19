import request from "supertest";
import app from "../../../app";
import {
  createVerifiedUser,
  createTestOrg,
  createTestProject,
  createTestPasswordPolicy,
  createTestProjectPolicy,
  createTestEndUser,
} from "../../helpers/testFactories";

describe("EndUser Integration", () => {
  let projectId: string;
  let BASE: string;

  beforeEach(async () => {
    const { user, accessToken } = await createVerifiedUser();
    const org = await createTestOrg(user._id.toString());
    const project = await createTestProject(org._id.toString(), user._id.toString());
    projectId = project._id.toString();
    BASE = `/api/v1/project/${projectId}/end-user`;

    // Set up policies required for end-user auth
    const pp = await createTestPasswordPolicy(projectId);
    await createTestProjectPolicy(projectId, pp._id.toString());
  });

  // ─── POST /end-user/signup ──────────────────────────────────────────────────
  describe("POST /signup", () => {
    it("returns 201 and creates end user", async () => {
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({
          fullName: "End User",
          email: `eu_${Date.now()}@test.com`,
          password: "endpass123",
          authMethod: "email",
          role: "user",
          status: "active",
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("user");
      expect(res.body.user.avatarUrl).toBeNull();
      expect(res.body.user).not.toHaveProperty("passwordHash");
    });

    it("returns 400 for duplicate email in same project", async () => {
      const email = `dup_eu_${Date.now()}@test.com`;
      await request(app)
        .post(`${BASE}/signup`)
        .send({ fullName: "EU", email, password: "pass123", authMethod: "email", role: "user", status: "active" });

      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({ fullName: "EU", email, password: "pass123", authMethod: "email", role: "user", status: "active" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("returns 400 when authMethod is not allowed by policy", async () => {
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({
          fullName: "EU",
          email: `eu2_${Date.now()}@test.com`,
          password: "pass123",
          authMethod: "google", // policy only allows "email"
          role: "user",
          status: "active",
        });

      expect(res.status).toBe(400);
    });

    it("returns 400 for a role not allowed by policy", async () => {
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({
          fullName: "EU",
          email: `eu3_${Date.now()}@test.com`,
          password: "pass123",
          authMethod: "email",
          role: "superadmin", // not in policy roles
          status: "active",
        });

      expect(res.status).toBe(400);
    });

    it("sets tokens in cookies", async () => {
      const res = await request(app)
        .post(`${BASE}/signup`)
        .send({
          fullName: "Cookie EU",
          email: `cookieeu_${Date.now()}@test.com`,
          password: "pass123",
          authMethod: "email",
          role: "user",
          status: "active",
        });

      expect(res.status).toBe(201);
      const cookies = res.headers["set-cookie"] as string[];
      expect(cookies.some((c: string) => c.startsWith("accessToken="))).toBe(true);
    });
  });

  // ─── POST /end-user/login ───────────────────────────────────────────────────
  describe("POST /login", () => {
    it("returns 200 with tokens on valid login", async () => {
      const email = `logineu_${Date.now()}@test.com`;
      await createTestEndUser(projectId, { email, password: "pass123" });

      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email, password: "pass123" });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(email);
    });

    it("returns 404 for user not in this project", async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: "nobody@test.com", password: "pass123" });

      expect(res.status).toBe(404);
    });

    it("returns 401 for wrong password", async () => {
      const email = `wrongpw_eu_${Date.now()}@test.com`;
      await createTestEndUser(projectId, { email });

      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email, password: "wrongpass" });

      expect(res.status).toBe(401);
    });
  });

  // ─── GET /end-user/logout ───────────────────────────────────────────────────
  describe("GET /logout", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app).get(`${BASE}/logout`);
      expect(res.status).toBe(401);
    });

    it("returns 200 on successful logout", async () => {
      const { accessToken } = await createTestEndUser(projectId);

      const res = await request(app)
        .get(`${BASE}/logout`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ─── GET /end-user/profile ──────────────────────────────────────────────────
  describe("GET /profile", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await request(app).get(`${BASE}/profile`);
      expect(res.status).toBe(401);
    });

    it("returns 200 with user profile including role and status", async () => {
      const { accessToken } = await createTestEndUser(projectId, { role: "user", status: "active" });

      const res = await request(app)
        .get(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("user");
      expect(res.body.user).not.toHaveProperty("passwordHash");
      expect(res.body.user).not.toHaveProperty("avatarKey");
    });
  });

  // ─── PATCH /end-user/profile ─────────────────────────────────────────────────
  describe("PATCH /profile", () => {
    it("returns 200 and updates fullName", async () => {
      const { accessToken } = await createTestEndUser(projectId);

      const res = await request(app)
        .patch(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({ fullName: "Updated End User" });

      expect(res.status).toBe(200);
      expect(res.body.user.fullName).toBe("Updated End User");
    });

    it("returns 400 when no fields provided", async () => {
      const { accessToken } = await createTestEndUser(projectId);

      const res = await request(app)
        .patch(`${BASE}/profile`)
        .set("Cookie", `accessToken=${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
