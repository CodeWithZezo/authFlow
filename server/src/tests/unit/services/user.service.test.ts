jest.mock("../../../app/models/schema/user.schema");
jest.mock("../../../app/models/schema/session.schema");
jest.mock("../../../app/utils/password.utils");
jest.mock("../../../app/utils/jwt.utils");

import { UserService } from "../../../app/modules/user/user.service";
import { User } from "../../../app/models/schema/user.schema";
import { Session } from "../../../app/models/schema/session.schema";
import { PasswordUtils } from "../../../app/utils/password.utils";
import { JWTUtils } from "../../../app/utils/jwt.utils";
import mongoose from "mongoose";

const MockUser = User as jest.Mocked<typeof User>;
const MockSession = Session as jest.Mocked<typeof Session>;
const MockPasswordUtils = PasswordUtils as jest.Mocked<typeof PasswordUtils>;
const MockJWTUtils = JWTUtils as jest.Mocked<typeof JWTUtils>;

const fakeUserId = new mongoose.Types.ObjectId().toString();
const fakeUser = {
  _id: fakeUserId,
  fullName: "Jane Doe",
  email: "jane@example.com",
  passwordHash: "hashed",
  phone: null,
  avatarUrl: null,
  avatarKey: null,
  isVerified: false,
};

// ─── Helper: build a full mock query chain ────────────────────────────────────
// Service calls: .findOne().select(...).lean() or .findById().select(...).lean()
// This helper returns the correct nested mock so every chain resolves correctly.
const mockQueryChain = (resolvedValue: any) => ({
  select: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(resolvedValue),
  }),
});

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();

    (MockPasswordUtils.validate as jest.Mock).mockReturnValue({ valid: true, errors: [] });
    (MockPasswordUtils.hash as jest.Mock).mockResolvedValue("hashed_password");
    (MockPasswordUtils.compare as jest.Mock).mockResolvedValue(true);
    (MockJWTUtils.generateAccessToken as jest.Mock).mockReturnValue("access_token");
    (MockJWTUtils.generateRefreshToken as jest.Mock).mockReturnValue("refresh_token");
  });

  // ─── signup ──────────────────────────────────────────────────────────────────
  describe("signup", () => {
    it("returns 201 with user + tokens on success", async () => {
      (MockUser.create as jest.Mock).mockResolvedValue(fakeUser);
      (MockSession.create as jest.Mock).mockResolvedValue({});

      const result = await service.signup({
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "TestPass123",
      });

      expect(result.status).toBe(201);
      expect((result.body as any).user.email).toBe("jane@example.com");
      expect((result.body as any).accessToken).toBe("access_token");
    });

    it("returns 400 if password validation fails", async () => {
      (MockPasswordUtils.validate as jest.Mock).mockReturnValue({
        valid: false,
        errors: ["Password too short"],
      });

      const result = await service.signup({
        fullName: "Jane",
        email: "jane@example.com",
        password: "ab",
      });

      expect(result.status).toBe(400);
      expect((result.body as any).message).toBe("Invalid password");
    });

    it("returns 400 on duplicate email (code 11000)", async () => {
      (MockUser.create as jest.Mock).mockRejectedValue({ code: 11000 });

      const result = await service.signup({
        fullName: "Jane",
        email: "jane@example.com",
        password: "TestPass123",
      });

      expect(result.status).toBe(400);
      expect((result.body as any).message).toBe("Email already exists");
    });

    it("returns 500 on unexpected DB error", async () => {
      (MockUser.create as jest.Mock).mockRejectedValue(new Error("DB crash"));

      const result = await service.signup({
        fullName: "Jane",
        email: "jane@example.com",
        password: "TestPass123",
      });

      expect(result.status).toBe(500);
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────────
  // FIX: service now calls .select("+passwordHash +avatarKey").lean()
  // so the mock chain must include .lean() after .select()
  describe("login", () => {
    it("returns 200 with tokens on valid credentials", async () => {
      (MockUser.findOne as jest.Mock).mockReturnValue(mockQueryChain(fakeUser));
      (MockSession.create as jest.Mock).mockResolvedValue({});

      const result = await service.login({ email: "jane@example.com", password: "TestPass123" });
      expect(result.status).toBe(200);
      expect((result.body as any).accessToken).toBe("access_token");
    });

    it("returns 404 when user not found", async () => {
      (MockUser.findOne as jest.Mock).mockReturnValue(mockQueryChain(null));

      const result = await service.login({ email: "nobody@example.com", password: "pass" });
      expect(result.status).toBe(404);
    });

    it("returns 401 on wrong password", async () => {
      (MockUser.findOne as jest.Mock).mockReturnValue(mockQueryChain(fakeUser));
      (MockPasswordUtils.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login({ email: "jane@example.com", password: "wrong" });
      expect(result.status).toBe(401);
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────
  describe("logout", () => {
    it("returns 200 and deletes the session", async () => {
      (MockSession.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const req: any = {
        cookies: { refreshToken: "refresh_token" },
        user: { userId: fakeUserId },
      };

      const result = await service.logout(req);
      expect(result.status).toBe(200);
      expect((result.body as any).message).toBe("Logged out successfully");
    });

    it("returns 200 even if no refresh token cookie", async () => {
      const req: any = { cookies: {}, user: { userId: fakeUserId } };
      const result = await service.logout(req);
      expect(result.status).toBe(200);
    });
  });

  // ─── requestPasswordReset ─────────────────────────────────────────────────
  // FIX: service now calls .select("+passwordHash").lean()
  // so the mock chain must include .lean() after .select()
  describe("requestPasswordReset", () => {
    it("returns 400 if email is undefined", async () => {
      const result = await service.requestPasswordReset("NewPass1", undefined, "current");
      expect(result.status).toBe(400);
    });

    it("returns 404 if user not found", async () => {
      (MockUser.findOne as jest.Mock).mockReturnValue(mockQueryChain(null));

      const result = await service.requestPasswordReset("NewPass1", "x@x.com", "current");
      expect(result.status).toBe(404);
    });

    it("returns 401 if current password is wrong", async () => {
      (MockUser.findOne as jest.Mock).mockReturnValue(mockQueryChain({ ...fakeUser }));
      (MockPasswordUtils.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.requestPasswordReset("NewPass1", "jane@example.com", "wrong");
      expect(result.status).toBe(401);
    });

    it("returns 200 on successful password reset", async () => {
      (MockUser.findOne as jest.Mock).mockReturnValue(mockQueryChain({ ...fakeUser, passwordHash: "old_hash" }));
      (MockPasswordUtils.compare as jest.Mock).mockResolvedValue(true);
      // updateOne is what the service now calls (no more .save())
      (MockUser.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      const result = await service.requestPasswordReset("NewPass1", "jane@example.com", "current");
      expect(result.status).toBe(200);
    });
  });
});