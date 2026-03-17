// tests/unit/middleware/auth.middleware.test.ts
// Tests authenticate() middleware in isolation using mocked req/res/next.
// No database connection — OrganizationMembership / ProjectMembership queries are mocked.

import { Request, Response, NextFunction } from "express";
import { authenticate, AuthRequest } from "../../../src/middleware/auth.middleware";
import { JWTUtils } from "../../../src/utils/jwt.utils";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET  = "unit-test-access-secret-32-chars-minimum!!";
  process.env.JWT_REFRESH_SECRET = "unit-test-refresh-secret-32-chars-minimum!";
  process.env.NODE_ENV = "test";
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res as Response;
}

function buildMockNext(): NextFunction {
  return jest.fn();
}

const VALID_PAYLOAD = { userId: "64f1a2b3c4d5e6f7a8b9c0d1", email: "jane@example.com" };

// ─── authenticate ─────────────────────────────────────────────────────────────
describe("authenticate middleware", () => {
  it("calls next() when a valid accessToken cookie is present", () => {
    const token = JWTUtils.generateAccessToken(VALID_PAYLOAD);
    const req   = { cookies: { accessToken: token } } as AuthRequest;
    const res   = buildMockRes();
    const next  = buildMockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ userId: VALID_PAYLOAD.userId, email: VALID_PAYLOAD.email });
  });

  it("attaches req.user with userId and email from the token payload", () => {
    const token = JWTUtils.generateAccessToken(VALID_PAYLOAD);
    const req   = { cookies: { accessToken: token } } as AuthRequest;
    const res   = buildMockRes();
    const next  = buildMockNext();

    authenticate(req, res, next);

    expect(req.user?.userId).toBe(VALID_PAYLOAD.userId);
    expect(req.user?.email).toBe(VALID_PAYLOAD.email);
  });

  it("strips 'Bearer ' prefix from the cookie value before verifying", () => {
    const token = JWTUtils.generateAccessToken(VALID_PAYLOAD);
    const req   = { cookies: { accessToken: `Bearer ${token}` } } as AuthRequest;
    const res   = buildMockRes();
    const next  = buildMockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user?.userId).toBe(VALID_PAYLOAD.userId);
  });

  it("returns 401 when no accessToken cookie is present", () => {
    const req  = { cookies: {} } as AuthRequest;
    const res  = buildMockRes();
    const next = buildMockNext();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });

  it("returns 401 when the accessToken cookie is expired or tampered with", () => {
    const token   = JWTUtils.generateAccessToken(VALID_PAYLOAD);
    const tampered = token.slice(0, -4) + "XXXX";
    const req  = { cookies: { accessToken: tampered } } as AuthRequest;
    const res  = buildMockRes();
    const next = buildMockNext();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when the cookie value is an empty string", () => {
    const req  = { cookies: { accessToken: "" } } as AuthRequest;
    const res  = buildMockRes();
    const next = buildMockNext();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when a refresh token is used instead of an access token", () => {
    // Refresh tokens are signed with a different secret — should fail access token verification
    const refreshToken = JWTUtils.generateRefreshToken(VALID_PAYLOAD);
    const req  = { cookies: { accessToken: refreshToken } } as AuthRequest;
    const res  = buildMockRes();
    const next = buildMockNext();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
