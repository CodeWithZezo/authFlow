// tests/unit/services/org.service.test.ts
// Tests OrgService methods with mocked Mongoose models.

jest.mock("../../../src/models/schema/org.schema", () => ({
  Organization: { create: jest.fn(), findById: jest.fn(), findByIdAndUpdate: jest.fn(), findByIdAndDelete: jest.fn() },
}));
jest.mock("../../../src/models/schema/organizationMembership.schema", () => ({
  OrganizationMembership: {
    create: jest.fn(), find: jest.fn(), findOne: jest.fn(),
    findOneAndUpdate: jest.fn(), deleteOne: jest.fn(), deleteMany: jest.fn(), countDocuments: jest.fn(),
  },
}));

import { OrgService } from "../../../src/org/org.service";
import { Organization }           from "../../../src/models/schema/org.schema";
import { OrganizationMembership } from "../../../src/models/schema/organizationMembership.schema";
import { Role, Status }           from "../../../src/models/enums";

beforeEach(() => jest.clearAllMocks());

const service = new OrgService();
const OWNER_ID = "64f1a2b3c4d5e6f7a8b9c0d1";
const ORG_ID   = "64f1a2b3c4d5e6f7a8b9c0d2";

const mockOrg = { _id: ORG_ID, name: "Test Org", slug: "test-org" };

// ─── createOrg ────────────────────────────────────────────────────────────────
describe("OrgService.createOrg", () => {
  it("returns 400 when name or slug is missing", async () => {
    const r1 = await service.createOrg({ name: "", slug: "slug" }, OWNER_ID);
    expect(r1.status).toBe(400);

    const r2 = await service.createOrg({ name: "Name", slug: "" }, OWNER_ID);
    expect(r2.status).toBe(400);
  });

  it("creates the org and auto-assigns the creator as OWNER", async () => {
    (Organization.create as jest.Mock).mockResolvedValue(mockOrg);
    (OrganizationMembership.create as jest.Mock).mockResolvedValue({});

    const result = await service.createOrg({ name: "Test Org", slug: "test-org" }, OWNER_ID);

    expect(result.status).toBe(201);
    expect((result.body as any).org).toMatchObject({ name: "Test Org" });

    const membershipCall = (OrganizationMembership.create as jest.Mock).mock.calls[0][0];
    expect(membershipCall.role).toBe(Role.OWNER);
    expect(membershipCall.status).toBe(Status.ACTIVE);
    expect(membershipCall.userId).toBe(OWNER_ID);
  });

  it("returns 409 on MongoDB duplicate key error (slug collision)", async () => {
    (Organization.create as jest.Mock).mockRejectedValue({ code: 11000 });

    const result = await service.createOrg({ name: "Test Org", slug: "test-org" }, OWNER_ID);

    expect(result.status).toBe(409);
    expect((result.body as any).message).toMatch(/slug already exists/i);
  });

  it("returns 500 on unexpected errors", async () => {
    (Organization.create as jest.Mock).mockRejectedValue(new Error("DB down"));

    const result = await service.createOrg({ name: "Test Org", slug: "test-org" }, OWNER_ID);
    expect(result.status).toBe(500);
  });
});

// ─── getOrg ───────────────────────────────────────────────────────────────────
describe("OrgService.getOrg", () => {
  it("returns 403 when the user has no membership in the org", async () => {
    (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => null });

    const result = await service.getOrg(ORG_ID, OWNER_ID);
    expect(result.status).toBe(403);
    expect((result.body as any).message).toMatch(/not a member/i);
  });

  it("returns 404 when the org does not exist", async () => {
    (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => ({ role: Role.MEMBER }) });
    (Organization.findById as jest.Mock).mockReturnValue({ lean: () => null });

    const result = await service.getOrg(ORG_ID, OWNER_ID);
    expect(result.status).toBe(404);
  });

  it("returns 200 with the org when the user is a member", async () => {
    (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => ({ role: Role.OWNER }) });
    (Organization.findById as jest.Mock).mockReturnValue({ lean: () => mockOrg });

    const result = await service.getOrg(ORG_ID, OWNER_ID);
    expect(result.status).toBe(200);
    expect((result.body as any).org).toMatchObject({ name: "Test Org" });
  });
});

// ─── deleteOrg ────────────────────────────────────────────────────────────────
describe("OrgService.deleteOrg", () => {
  it("returns 404 when the org does not exist", async () => {
    (Organization.findByIdAndDelete as jest.Mock).mockReturnValue({ lean: () => null });

    const result = await service.deleteOrg(ORG_ID);
    expect(result.status).toBe(404);
  });

  it("deletes the org and cascades to memberships", async () => {
    (Organization.findByIdAndDelete as jest.Mock).mockReturnValue({ lean: () => mockOrg });
    (OrganizationMembership.deleteMany as jest.Mock).mockResolvedValue({});

    const result = await service.deleteOrg(ORG_ID);

    expect(result.status).toBe(200);
    expect(OrganizationMembership.deleteMany).toHaveBeenCalledWith({ orgId: ORG_ID });
  });
});

// ─── removeOrgMember ──────────────────────────────────────────────────────────
describe("OrgService.removeOrgMember", () => {
  it("returns 404 when the membership does not exist", async () => {
    (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => null });

    const result = await service.removeOrgMember(ORG_ID, OWNER_ID);
    expect(result.status).toBe(404);
  });

  it("returns 400 when trying to remove the last owner", async () => {
    (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => ({ role: Role.OWNER }) });
    (OrganizationMembership.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await service.removeOrgMember(ORG_ID, OWNER_ID);
    expect(result.status).toBe(400);
    expect((result.body as any).message).toMatch(/last owner/i);
  });

  it("removes the member successfully when not the last owner", async () => {
    (OrganizationMembership.findOne as jest.Mock).mockReturnValue({ lean: () => ({ role: Role.MEMBER }) });
    (OrganizationMembership.countDocuments as jest.Mock).mockResolvedValue(1);
    (OrganizationMembership.deleteOne as jest.Mock).mockResolvedValue({});

    const result = await service.removeOrgMember(ORG_ID, OWNER_ID);
    expect(result.status).toBe(200);
    expect(OrganizationMembership.deleteOne).toHaveBeenCalledTimes(1);
  });
});
