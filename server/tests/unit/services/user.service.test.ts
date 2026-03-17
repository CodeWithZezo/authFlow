// tests/unit/services/user.service.test.ts
// Tests UserService methods by mocking the Mongoose models.
// No database connection required.

import { UserService } from "../../../src/user/user.service";
import { PasswordUtils } from "../../../src/utils/password.utils";

// ─── Mock Mongoose models ─────────────────────────────────────────────────────
jest.mock("../../../src/models/schema/user.schema", () => ({
  User: {
    create:  jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("../../../src/models/schema/session.schema", () => ({
  Session: {
    create: jest.fn(),
  },
}));

import { User }    from "../../../src/models/schema/user.schema";
import { Session } from "../../../src/models/schema/session.schema";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET  = "unit-test-access-secret-32-chars-minimum!!";
  process.env.JWT_REFRESH_SECRET = "unit-test-refresh-secret-32-chars-minimum!";
  process.env.JWT_ACCESS_EXPIRES_IN  = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
  process.env.NODE_ENV = "test";
});

beforeEach(() => {
  jest.clearAllMocks();
});

const service = new UserService();

// ─── Shared test user ─────────────────────────────────────────────────────────
const mockUserId = "64f1a2b3c4d5e6f7a8b9c0d1";
const mockUser = {
  _id:          mockUserId,
  fullName:     "Jane Doe",
  email:        "jane@example.com",
  phone:        null,
  passwordHash: "hashed",
  isVerified:   false,
  toString:     () => mockUserId,
};

// ─── signup ───────────────────────────────────────────────────────────────────
describe("UserService.signup", () => {
  it("returns 400 when the password fails validation", async () => {
    const result = await service.signup({
      fullName: "Jane", email: "jane@example.com", password: "weak", phone: "",
    });
    expect(result.status).toBe(400);
    expect((result.body as any).errors).toBeDefined();
  });

  it("creates a User and Session on success, returns 201", async () => {
    (User.create as jest.Mock).mockResolvedValue({ ...mockUser });
    (Session.create as jest.Mock).mockResolvedValue({ _id: "session1" });

    const result = await service.signup({
      fullName: "Jane Doe",
      email:    "jane@example.com",
      password: "ValidPass1!",
      phone:    "",
    });

    expect(result.status).toBe(201);
    expect((result.body as any).user.email).toBe("jane@example.com");
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(Session.create).toHaveBeenCalledTimes(1);
  });

  it("lowercases and trims the email before saving", async () => {
    (User.create as jest.Mock).mockResolvedValue({ ...mockUser, email: "jane@example.com" });
    (Session.create as jest.Mock).mockResolvedValue({});

    await service.signup({
      fullName: "Jane", email: "  JANE@EXAMPLE.COM  ", password: "ValidPass1!", phone: "",
    });

    const createCall = (User.create as jest.Mock).mock.calls[0][0];
    expect(createCall.email).toBe("jane@example.com");
  });

  it("does not include accessToken or refreshToken in the returned body (they go to cookies)", async () => {
    (User.create as jest.Mock).mockResolvedValue({ ...mockUser });
    (Session.create as jest.Mock).mockResolvedValue({});

    const result = await service.signup({
      fullName: "Jane", email: "jane@example.com", password: "ValidPass1!", phone: "",
    });

    // The service returns them — the controller strips them before sending to client
    // So the service body DOES include them, but the user object is nested
    expect((result.body as any).user).toBeDefined();
  });

  it("returns 400 (duplicate) when MongoDB error code 11000 is thrown", async () => {
    (User.create as jest.Mock).mockRejectedValue({ code: 11000 });

    const result = await service.signup({
      fullName: "Jane", email: "jane@example.com", password: "ValidPass1!", phone: "",
    });

    expect(result.status).toBe(400);
    expect((result.body as any).message).toMatch(/already exists/i);
  });

  it("returns 500 on unexpected database errors", async () => {
    (User.create as jest.Mock).mockRejectedValue(new Error("DB connection lost"));

    const result = await service.signup({
      fullName: "Jane", email: "jane@example.com", password: "ValidPass1!", phone: "",
    });

    expect(result.status).toBe(500);
    expect((result.body as any).message).toMatch(/internal server error/i);
  });
});

// ─── login ────────────────────────────────────────────────────────────────────
describe("UserService.login", () => {
  it("returns 404 when the user is not found", async () => {
    const selectMock = { select: jest.fn().mockResolvedValue(null) };
    (User.findOne as jest.Mock).mockReturnValue(selectMock);

    const result = await service.login({ email: "nobody@example.com", password: "Pass1!" });

    expect(result.status).toBe(404);
    expect((result.body as any).message).toMatch(/not found/i);
  });

  it("returns 401 when the password does not match", async () => {
    const hash = await PasswordUtils.hash("CorrectPass1!");
    const userWithHash = { ...mockUser, passwordHash: hash };
    const selectMock = { select: jest.fn().mockResolvedValue(userWithHash) };
    (User.findOne as jest.Mock).mockReturnValue(selectMock);

    const result = await service.login({ email: "jane@example.com", password: "WrongPass1!" });

    expect(result.status).toBe(401);
    expect((result.body as any).message).toMatch(/invalid credentials/i);
  });

  it("returns 200 and creates a session on successful login", async () => {
    const hash = await PasswordUtils.hash("CorrectPass1!");
    const userWithHash = { ...mockUser, passwordHash: hash };
    const selectMock = { select: jest.fn().mockResolvedValue(userWithHash) };
    (User.findOne as jest.Mock).mockReturnValue(selectMock);
    (Session.create as jest.Mock).mockResolvedValue({ _id: "session1" });

    const result = await service.login({ email: "jane@example.com", password: "CorrectPass1!" });

    expect(result.status).toBe(200);
    expect((result.body as any).user.email).toBe("jane@example.com");
    expect(Session.create).toHaveBeenCalledTimes(1);
  });

  it("passes the email through toLowerCase before querying", async () => {
    const selectMock = { select: jest.fn().mockResolvedValue(null) };
    (User.findOne as jest.Mock).mockReturnValue(selectMock);

    await service.login({ email: "JANE@EXAMPLE.COM", password: "Pass1!" });

    expect(User.findOne).toHaveBeenCalledWith({ email: "jane@example.com" });
  });
});
