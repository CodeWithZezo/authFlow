jest.mock("../../../app/models/schema/session.schema");
jest.mock("../../../app/models/schema/passwordPolicy.schema");
jest.mock("../../../app/models/schema/projectPolicy.schema");
jest.mock("../../../app/models/schema/project.schema");

import { SessionService } from "../../../app/modules/session/session.service";
import { PasswordPolicyService } from "../../../app/modules/passwordPolicy/passwordPolicy.service";
import { ProjectPolicyService } from "../../../app/modules/projectPolicy/projectPolicy.service";
import { Session } from "../../../app/models/schema/session.schema";
import { PasswordPolicy } from "../../../app/models/schema/passwordPolicy.schema";
import { ProjectPolicy } from "../../../app/models/schema/projectPolicy.schema";
import { Project } from "../../../app/models/schema/project.schema";
import mongoose from "mongoose";

const fakeUserId = new mongoose.Types.ObjectId().toString();
const fakeProjectId = new mongoose.Types.ObjectId().toString();
const fakeSessionId = new mongoose.Types.ObjectId().toString();
const fakeSession = { _id: fakeSessionId, userId: fakeUserId, refreshToken: "rt" };
const fakeProject = { _id: fakeProjectId, name: "Alpha" };
const fakePasswordPolicy = { _id: new mongoose.Types.ObjectId().toString(), projectId: fakeProjectId, minLength: 6 };

// ─── SessionService ──────────────────────────────────────────────────────────
describe("SessionService", () => {
  let service: SessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SessionService();
  });

  describe("getSessions", () => {
    it("returns 200 with sessions array", async () => {
      (Session.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeSession]),
      });

      const result = await service.getSessions(fakeUserId);
      expect(result.status).toBe(200);
      expect((result.body as any).sessions).toHaveLength(1);
      expect((result.body as any).count).toBe(1);
    });
  });

  describe("revokeSession", () => {
    it("returns 404 when session not found", async () => {
      (Session.findOneAndDelete as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.revokeSession(fakeUserId, fakeSessionId);
      expect(result.status).toBe(404);
    });

    it("returns 200 on successful revoke", async () => {
      (Session.findOneAndDelete as jest.Mock).mockReturnValue({ lean: () => fakeSession });
      const result = await service.revokeSession(fakeUserId, fakeSessionId);
      expect(result.status).toBe(200);
      expect((result.body as any).isCurrentSession).toBe(false);
    });
  });

  describe("revokeAllSessions", () => {
    it("returns 200 with deleted count", async () => {
      (Session.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 3 });
      const result = await service.revokeAllSessions(fakeUserId);
      expect(result.status).toBe(200);
      expect((result.body as any).revokedCount).toBe(3);
    });
  });
});

// ─── PasswordPolicyService ───────────────────────────────────────────────────
describe("PasswordPolicyService", () => {
  let service: PasswordPolicyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PasswordPolicyService();
  });

  describe("createPasswordPolicy", () => {
    it("returns 404 when project not found", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.createPasswordPolicy(fakeProjectId, {});
      expect(result.status).toBe(404);
    });

    it("returns 409 when policy already exists", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => fakeProject });
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => fakePasswordPolicy });

      const result = await service.createPasswordPolicy(fakeProjectId, {});
      expect(result.status).toBe(409);
    });

    it("returns 201 with created policy on success", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => fakeProject });
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      (PasswordPolicy.create as jest.Mock).mockResolvedValue(fakePasswordPolicy);

      const result = await service.createPasswordPolicy(fakeProjectId, { minLength: 8 });
      expect(result.status).toBe(201);
    });
  });

  describe("getPasswordPolicy", () => {
    it("returns 404 when no policy exists", async () => {
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.getPasswordPolicy(fakeProjectId);
      expect(result.status).toBe(404);
    });

    it("returns 200 with policy", async () => {
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => fakePasswordPolicy });
      const result = await service.getPasswordPolicy(fakeProjectId);
      expect(result.status).toBe(200);
      expect((result.body as any).passwordPolicy).toEqual(fakePasswordPolicy);
    });
  });

  describe("updatePasswordPolicy", () => {
    it("returns 400 when no fields provided", async () => {
      const result = await service.updatePasswordPolicy(fakeProjectId, {});
      expect(result.status).toBe(400);
    });

    it("returns 400 when minLength is less than 4", async () => {
      const result = await service.updatePasswordPolicy(fakeProjectId, { minLength: 2 });
      expect(result.status).toBe(400);
    });

    it("returns 404 when policy not found", async () => {
      (PasswordPolicy.findOneAndUpdate as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.updatePasswordPolicy(fakeProjectId, { minLength: 8 });
      expect(result.status).toBe(404);
    });

    it("returns 200 on successful update", async () => {
      (PasswordPolicy.findOneAndUpdate as jest.Mock).mockReturnValue({
        lean: () => ({ ...fakePasswordPolicy, minLength: 8 }),
      });
      const result = await service.updatePasswordPolicy(fakeProjectId, { minLength: 8 });
      expect(result.status).toBe(200);
    });
  });

  describe("deletePasswordPolicy", () => {
    it("returns 404 when no policy exists", async () => {
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.deletePasswordPolicy(fakeProjectId);
      expect(result.status).toBe(404);
    });

    it("returns 400 when project policy still references it", async () => {
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => fakePasswordPolicy });
      (ProjectPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => ({ _id: "pp1" }) });

      const result = await service.deletePasswordPolicy(fakeProjectId);
      expect(result.status).toBe(400);
      expect((result.body as any).message).toMatch(/project policy/i);
    });

    it("returns 200 on successful delete", async () => {
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => fakePasswordPolicy });
      (ProjectPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      (PasswordPolicy.deleteOne as jest.Mock).mockResolvedValue({});

      const result = await service.deletePasswordPolicy(fakeProjectId);
      expect(result.status).toBe(200);
    });
  });
});

// ─── ProjectPolicyService ────────────────────────────────────────────────────
describe("ProjectPolicyService", () => {
  let service: ProjectPolicyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectPolicyService();
  });

  describe("createPolicy", () => {
    it("returns 404 when project not found", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.createPolicy(fakeProjectId, {});
      expect(result.status).toBe(404);
    });

    it("returns 409 when policy already exists", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => fakeProject });
      (ProjectPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => ({ _id: "pp" }) });

      const result = await service.createPolicy(fakeProjectId, {});
      expect(result.status).toBe(409);
    });

    it("returns 400 when no password policy exists", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => fakeProject });
      (ProjectPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });

      const result = await service.createPolicy(fakeProjectId, {});
      expect(result.status).toBe(400);
      expect((result.body as any).message).toMatch(/password policy/i);
    });

    it("returns 201 on success", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => fakeProject });
      (ProjectPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => fakePasswordPolicy });
      (ProjectPolicy.create as jest.Mock).mockResolvedValue({ projectId: fakeProjectId });

      const result = await service.createPolicy(fakeProjectId, {});
      expect(result.status).toBe(201);
    });
  });

  describe("updatePolicy", () => {
    it("returns 400 when no fields provided", async () => {
      const result = await service.updatePolicy(fakeProjectId, {});
      expect(result.status).toBe(400);
    });

    it("returns 404 when policy not found", async () => {
      (ProjectPolicy.findOneAndUpdate as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.updatePolicy(fakeProjectId, { phoneRequired: true });
      expect(result.status).toBe(404);
    });
  });
});
