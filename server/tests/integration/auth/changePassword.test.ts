// tests/integration/auth/changePassword.test.ts
// Tests PATCH /api/v1/auth/change-password

import request from "supertest";
import app     from "../../helpers/app";
import { createUser, authCookiesForUser } from "../../helpers/factories";

describe("PATCH /api/v1/auth/change-password", () => {

  it("returns 200 when current password is correct and new password is valid", async () => {
    const { user, plainPassword } = await createUser({ email: "chpwd@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({ currentPassword: plainPassword, newPassword: "NewPass2@!" });

    expect(res.status).toBe(200);
  });

  it("allows login with the new password after a successful change", async () => {
    const { user, plainPassword } = await createUser({ email: "chpwd2@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({ currentPassword: plainPassword, newPassword: "BrandNew99!" });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: "BrandNew99!" });

    expect(loginRes.status).toBe(200);
  });

  it("returns 401 when the current password is wrong", async () => {
    const { user } = await createUser({ email: "wrongcurrent@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({ currentPassword: "WrongCurrent1!", newPassword: "NewPass2@" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when the new password fails strength validation", async () => {
    const { user, plainPassword } = await createUser({ email: "weaknew@example.com" });
    const { cookieHeader } = await authCookiesForUser(user._id, user.email);

    const res = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Cookie", cookieHeader)
      .send({ currentPassword: plainPassword, newPassword: "weak" });

    expect(res.status).toBe(400);
  });

  it("returns 401 when no auth cookie is provided", async () => {
    const res = await request(app)
      .patch("/api/v1/auth/change-password")
      .send({ currentPassword: "OldPass1!", newPassword: "NewPass2!" });

    expect(res.status).toBe(401);
  });
});
