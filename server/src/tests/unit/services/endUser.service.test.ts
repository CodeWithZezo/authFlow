jest.mock("../../../app/models/schema/endUser.schema");
jest.mock("../../../app/models/schema/user.schema");
jest.mock("../../../app/models/schema/session.schema");
jest.mock("../../../app/utils/password.utils");
jest.mock("../../../app/utils/jwt.utils");
jest.mock("../../../app/utils/uinifiedSignupValidator");

import { EndUserService } from "../../../app/services/endUsers/endUser.service";
import { EndUser } from "../../../app/models/schema/endUser.schema";
import { User } from "../../../app/models/schema/user.schema";
import { Session } from "../../../app/models/schema/session.schema";
import { PasswordUtils } from "../../../app/utils/password.utils";
import { JWTUtils } from "../../../app/utils/jwt.utils";
import {
  validateSignupAgainstProjectPolicy,
  findUserByEmailInProject,
} from "../../../app/utils/uinifiedSignupValidator";
import mongoose from "mongoose";

const fakeUserId = new mongoose.Types.ObjectId().toString();
const fakeProjectId = new mongoose.Types.ObjectId().toString();
const fakeUser = { _id: fakeUserId, fullName: "End User", email: "eu@test.com", phone: null, passwordHash: "hashed" };
const fakeEndUser = { _id: "eu1", userId: fakeUserId, projectId: fakeProjectId, role: "user", status: "active" };
const fakeContext = {
  project: { _id: fakeProjectId, name: "Test Project" },
  projectPolicy: { authType: "password", authMethods: ["email"], authRequired: true },
  passwordPolicy: { minLength: 6 },
};

describe("EndUserService", () => {
  let service: EndUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EndUserService();
    (JWTUtils.generateAccessToken as jest.Mock).mockReturnValue("access_token");
    (JWTUtils.generateRefreshToken as jest.Mock).mockReturnValue("refresh_token");
  });

  // ─── signupService ───────────────────────────────────────────────────────────
  describe("signupService", () => {
    it("returns 404 when project or policy missing", async () => {
      const result = await service.signupService({}, { project: null, projectPolicy: null });
      expect(result.status).toBe(404);
    });

    it("returns 400 when policy validation fails", async () => {
      (validateSignupAgainstProjectPolicy as jest.Mock).mockReturnValue({
        valid: false,
        errors: ["Auth method required"],
      });

      const result = await service.signupService({ email: "x@x.com" }, fakeContext);
      expect(result.status).toBe(400);
      expect(result.body.errors).toContain("Auth method required");
    });

    it("returns 400 when user already exists in project", async () => {
      (validateSignupAgainstProjectPolicy as jest.Mock).mockReturnValue({ valid: true, errors: [] });
      (findUserByEmailInProject as jest.Mock).mockResolvedValue({ user: fakeUser, endUser: fakeEndUser });

      const result = await service.signupService({ email: "eu@test.com", password: "pass" }, fakeContext);
      expect(result.status).toBe(400);
      expect((result.body as any).message).toMatch(/already exists/i);
    });

    it("returns 201 with tokens on successful signup", async () => {
      (validateSignupAgainstProjectPolicy as jest.Mock).mockReturnValue({ valid: true, errors: [] });
      (findUserByEmailInProject as jest.Mock).mockResolvedValue(null);
      (PasswordUtils.hash as jest.Mock).mockResolvedValue("hashed");
      (User.create as jest.Mock).mockResolvedValue(fakeUser);
      (EndUser.create as jest.Mock).mockResolvedValue(fakeEndUser);
      (Session.create as jest.Mock).mockResolvedValue({});

      const result = await service.signupService(
        { fullName: "End User", email: "eu@test.com", password: "pass123", authMethod: "email" },
        fakeContext
      );

      expect(result.status).toBe(201);
      expect(result.accessToken).toBe("access_token");
      expect(result.refreshToken).toBe("refresh_token");
      expect(result.body.user.avatarUrl).toBeNull();
    });
  });

  // ─── loginService ───────────────────────────────────────────────────────────
  describe("loginService", () => {
    it("returns 404 when user not found in project", async () => {
      (findUserByEmailInProject as jest.Mock).mockResolvedValue(null);

      const result = await service.loginService({ email: "nobody@x.com", password: "pass" }, fakeContext);
      expect(result.status).toBe(404);
    });

    it("returns 401 on wrong password", async () => {
      (findUserByEmailInProject as jest.Mock).mockResolvedValue({ user: fakeUser, endUser: fakeEndUser });
      (PasswordUtils.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.loginService({ email: "eu@test.com", password: "wrong" }, fakeContext);
      expect(result.status).toBe(401);
    });

    it("returns 200 with tokens on success", async () => {
      (findUserByEmailInProject as jest.Mock).mockResolvedValue({ user: fakeUser, endUser: fakeEndUser });
      (PasswordUtils.compare as jest.Mock).mockResolvedValue(true);
      (Session.create as jest.Mock).mockResolvedValue({});
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, avatarKey: null }),
      });

      const result = await service.loginService({ email: "eu@test.com", password: "pass123" }, fakeContext);
      expect(result.status).toBe(200);
      expect(result.accessToken).toBe("access_token");
      expect(result.body.user.avatarUrl).toBeNull();
    });

    it("returns streaming avatarUrl when avatarKey exists", async () => {
      (findUserByEmailInProject as jest.Mock).mockResolvedValue({ user: fakeUser, endUser: fakeEndUser });
      (PasswordUtils.compare as jest.Mock).mockResolvedValue(true);
      (Session.create as jest.Mock).mockResolvedValue({});
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: fakeUserId, avatarKey: "avatars/endusers/eu.jpg" }),
      });

      const result = await service.loginService({ email: "eu@test.com", password: "pass" }, fakeContext);
      const url = result.body.user.avatarUrl as string;

      expect(url).toContain(`/api/v1/project/${fakeProjectId}/end-user/avatar/`);
      expect(url).not.toContain("amazonaws.com");
    });
  });

  // ─── logOutService ──────────────────────────────────────────────────────────
  describe("logOutService", () => {
    it("returns 404 when userId missing", async () => {
      const result = await service.logOutService({}, fakeContext);
      expect(result.status).toBe(404);
    });

    it("returns 404 when session not found", async () => {
      (Session.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.logOutService({ userId: fakeUserId }, fakeContext);
      expect(result.status).toBe(404);
    });

    it("returns 200 and deletes session", async () => {
      const deleteOne = jest.fn().mockResolvedValue({});
      (Session.findOne as jest.Mock).mockResolvedValue({ deleteOne });

      const result = await service.logOutService({ userId: fakeUserId }, fakeContext);
      expect(result.status).toBe(200);
      expect(deleteOne).toHaveBeenCalled();
    });
  });
});
