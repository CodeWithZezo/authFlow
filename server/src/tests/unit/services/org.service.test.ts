jest.mock("../../../app/models/schema/org.schema");
jest.mock("../../../app/models/schema/organizationMembership.schema");
jest.mock("../../../app/utils/user.utils");

import { OrgService } from "../../../app/modules/org/org.service";
import { Organization } from "../../../app/models/schema/org.schema";
import { OrganizationMembership } from "../../../app/models/schema/organizationMembership.schema";
import { isVerifiedUser } from "../../../app/utils/user.utils";
import { Role, Status } from "../../../app/models/enums";
import mongoose from "mongoose";

const fakeOrgId = new mongoose.Types.ObjectId().toString();
const fakeUserId = new mongoose.Types.ObjectId().toString();
const fakeOrg = { _id: fakeOrgId, name: "Acme", slug: "acme" };

describe("OrgService", () => {
  let service: OrgService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrgService();
  });

  // ─── createOrg ───────────────────────────────────────────────────────────────
  describe("createOrg", () => {
    it("returns 403 when user is not verified", async () => {
      (isVerifiedUser as jest.Mock).mockResolvedValue(false);
      const result = await service.createOrg({ name: "Acme", slug: "acme" }, fakeUserId);
      expect(result.status).toBe(403);
      expect((result.body as any).message).toMatch(/verification/i);
    });

    it("returns 400 when name or slug is missing", async () => {
      (isVerifiedUser as jest.Mock).mockResolvedValue(true);
      const result = await service.createOrg({ name: "", slug: "" }, fakeUserId);
      expect(result.status).toBe(400);
    });

    it("returns 201 and creates org + membership on success", async () => {
      (isVerifiedUser as jest.Mock).mockResolvedValue(true);
      (Organization.create as jest.Mock).mockResolvedValue(fakeOrg);
      (OrganizationMembership.create as jest.Mock).mockResolvedValue({});

      const result = await service.createOrg({ name: "Acme", slug: "acme" }, fakeUserId);
      expect(result.status).toBe(201);
      expect((result.body as any).org).toEqual(fakeOrg);
      expect(OrganizationMembership.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.OWNER, status: Status.ACTIVE })
      );
    });

    it("returns 409 on duplicate slug (code 11000)", async () => {
      (isVerifiedUser as jest.Mock).mockResolvedValue(true);
      (Organization.create as jest.Mock).mockRejectedValue({ code: 11000 });

      const result = await service.createOrg({ name: "Acme", slug: "acme" }, fakeUserId);
      expect(result.status).toBe(409);
    });
  });

  // ─── getOrg ──────────────────────────────────────────────────────────────────
  describe("getOrg", () => {
    it("returns 403 when user is not a member", async () => {
      (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.getOrg(fakeOrgId, fakeUserId);
      expect(result.status).toBe(403);
    });

    it("returns 404 when org does not exist", async () => {
      (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => ({ role: "member" }) });
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => null });

      const result = await service.getOrg(fakeOrgId, fakeUserId);
      expect(result.status).toBe(404);
    });

    it("returns 200 with org data on success", async () => {
      (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => ({ role: "owner" }) });
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => fakeOrg });

      const result = await service.getOrg(fakeOrgId, fakeUserId);
      expect(result.status).toBe(200);
      expect((result.body as any).org).toEqual(fakeOrg);
    });
  });

  // ─── deleteOrg ───────────────────────────────────────────────────────────────
  describe("deleteOrg", () => {
    it("returns 404 when org does not exist", async () => {
      (Organization.findByIdAndDelete as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.deleteOrg(fakeOrgId);
      expect(result.status).toBe(404);
    });

    it("returns 200 and cascade deletes memberships", async () => {
      (Organization.findByIdAndDelete as jest.Mock).mockReturnValue({ lean: () => fakeOrg });
      (OrganizationMembership.deleteMany as jest.Mock).mockResolvedValue({});

      const result = await service.deleteOrg(fakeOrgId);
      expect(result.status).toBe(200);
      expect(OrganizationMembership.deleteMany).toHaveBeenCalledWith({ orgId: fakeOrgId });
    });
  });

  // ─── addOrgMember ─────────────────────────────────────────────────────────
  describe("addOrgMember", () => {
    it("returns 400 when userId is missing", async () => {
      const result = await service.addOrgMember(fakeOrgId, { userId: "" });
      expect(result.status).toBe(400);
    });

    it("returns 404 when org not found", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.addOrgMember(fakeOrgId, { userId: fakeUserId });
      expect(result.status).toBe(404);
    });

    it("returns 201 on successful member add", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => fakeOrg });
      (OrganizationMembership.create as jest.Mock).mockResolvedValue({ userId: fakeUserId, role: Role.MEMBER });

      const result = await service.addOrgMember(fakeOrgId, { userId: fakeUserId });
      expect(result.status).toBe(201);
    });

    it("returns 409 on duplicate membership (code 11000)", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => fakeOrg });
      (OrganizationMembership.create as jest.Mock).mockRejectedValue({ code: 11000 });

      const result = await service.addOrgMember(fakeOrgId, { userId: fakeUserId });
      expect(result.status).toBe(409);
    });
  });

  // ─── removeOrgMember ─────────────────────────────────────────────────────
  describe("removeOrgMember", () => {
    it("returns 404 when member not found", async () => {
      (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.removeOrgMember(fakeOrgId, fakeUserId);
      expect(result.status).toBe(404);
    });

    it("returns 400 when trying to remove the last owner", async () => {
      (OrganizationMembership.findOne as jest.Mock).mockReturnValue({
        lean: () => ({ role: Role.OWNER }),
      });
      (OrganizationMembership.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await service.removeOrgMember(fakeOrgId, fakeUserId);
      expect(result.status).toBe(400);
    });

    it("returns 200 when removing a non-last-owner member", async () => {
      (OrganizationMembership.findOne as jest.Mock).mockReturnValue({
        lean: () => ({ role: Role.MEMBER }),
      });
      (OrganizationMembership.deleteOne as jest.Mock).mockResolvedValue({});

      const result = await service.removeOrgMember(fakeOrgId, fakeUserId);
      expect(result.status).toBe(200);
    });
  });
});
