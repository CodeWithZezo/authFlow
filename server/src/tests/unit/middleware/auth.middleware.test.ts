jest.mock("../../../app/utils/jwt.utils");
jest.mock("../../../app/utils/user.utils");

import { authenticate, roleAuthorize } from "../../../app/middleware/auth.middleware";
import { JWTUtils } from "../../../app/utils/jwt.utils";
import {
  checkOrganizationMembershipByUserIdAndOrgId,
  checkProjectMembershipByUserIdAndProjectId,
} from "../../../app/utils/user.utils";
import { Request, Response, NextFunction } from "express";

const mockReq = (overrides: any = {}): Partial<Request> => ({
  cookies: {},
  params: {},
  body: {},
  query: {},
  ...overrides,
});

const mockRes = (): Partial<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe("auth.middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── authenticate ──────────────────────────────────────────────────────────
  describe("authenticate", () => {
    it("returns 401 when no token in cookies", () => {
      const req = mockReq({ cookies: {} });
      const res = mockRes();

      authenticate(req as any, res as any, mockNext);
      expect((res.status as jest.Mock)).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("returns 401 for invalid/expired token", () => {
      (JWTUtils.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error("jwt expired");
      });

      const req = mockReq({ cookies: { accessToken: "bad.token" } });
      const res = mockRes();

      authenticate(req as any, res as any, mockNext);
      expect((res.status as jest.Mock)).toHaveBeenCalledWith(401);
    });

    it("calls next() and sets req.user on valid token", () => {
      (JWTUtils.verifyAccessToken as jest.Mock).mockReturnValue({
        userId: "user123",
        email: "u@test.com",
      });

      const req = mockReq({ cookies: { accessToken: "valid.token" } }) as any;
      const res = mockRes();

      authenticate(req, res as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(req.user).toEqual({ userId: "user123", email: "u@test.com" });
    });

    it("strips Bearer prefix from token", () => {
      (JWTUtils.verifyAccessToken as jest.Mock).mockReturnValue({
        userId: "user123",
        email: "u@test.com",
      });

      const req = mockReq({ cookies: { accessToken: "Bearer valid.token" } }) as any;
      const res = mockRes();

      authenticate(req, res as any, mockNext);
      expect(JWTUtils.verifyAccessToken).toHaveBeenCalledWith("valid.token");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ─── roleAuthorize ─────────────────────────────────────────────────────────
  describe("roleAuthorize", () => {
    it("returns 401 when req.user is not set", async () => {
      const middleware = roleAuthorize("owner", "organization");
      const req = mockReq({ params: { orgId: "org1" } });
      const res = mockRes();

      await middleware(req as any, res as any, mockNext);
      expect((res.status as jest.Mock)).toHaveBeenCalledWith(401);
    });

    it("returns 400 when orgId is missing for organization type", async () => {
      const middleware = roleAuthorize("owner", "organization");
      const req = mockReq({ user: { userId: "u1" }, params: {} });
      const res = mockRes();

      await middleware(req as any, res as any, mockNext);
      expect((res.status as jest.Mock)).toHaveBeenCalledWith(400);
    });

    it("returns 404 when membership not found", async () => {
      (checkOrganizationMembershipByUserIdAndOrgId as jest.Mock).mockResolvedValue(null);

      const middleware = roleAuthorize("owner", "organization");
      const req = mockReq({ user: { userId: "u1" }, params: { orgId: "org1" } });
      const res = mockRes();

      await middleware(req as any, res as any, mockNext);
      expect((res.status as jest.Mock)).toHaveBeenCalledWith(404);
    });

    it("returns 403 when user role is not in allowed roles", async () => {
      (checkOrganizationMembershipByUserIdAndOrgId as jest.Mock).mockResolvedValue({ role: "member" });

      const middleware = roleAuthorize("owner", "organization");
      const req = mockReq({ user: { userId: "u1" }, params: { orgId: "org1" } });
      const res = mockRes();

      await middleware(req as any, res as any, mockNext);
      expect((res.status as jest.Mock)).toHaveBeenCalledWith(403);
    });

    it("calls next() when role matches", async () => {
      (checkOrganizationMembershipByUserIdAndOrgId as jest.Mock).mockResolvedValue({ role: "owner" });

      const middleware = roleAuthorize("owner", "organization");
      const req = mockReq({ user: { userId: "u1" }, params: { orgId: "org1" } });
      const res = mockRes();

      await middleware(req as any, res as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("accepts an array of roles and allows any matching role", async () => {
      (checkOrganizationMembershipByUserIdAndOrgId as jest.Mock).mockResolvedValue({ role: "admin" });

      const middleware = roleAuthorize(["owner", "admin"], "organization");
      const req = mockReq({ user: { userId: "u1" }, params: { orgId: "org1" } });
      const res = mockRes();

      await middleware(req as any, res as any, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("checks project membership for project type", async () => {
      (checkProjectMembershipByUserIdAndProjectId as jest.Mock).mockResolvedValue({ role: "manager" });

      const middleware = roleAuthorize("manager", "project");
      const req = mockReq({ user: { userId: "u1" }, params: { projectId: "proj1" } });
      const res = mockRes();

      await middleware(req as any, res as any, mockNext);
      expect(checkProjectMembershipByUserIdAndProjectId).toHaveBeenCalledWith("u1", "proj1");
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
