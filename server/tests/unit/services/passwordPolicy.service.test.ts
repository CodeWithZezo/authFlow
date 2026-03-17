// tests/unit/services/passwordPolicy.service.test.ts

jest.mock("../../../src/models/schema/passwordPolicy.schema", () => ({
  PasswordPolicy: {
    create: jest.fn(), findOne: jest.fn(), findOneAndUpdate: jest.fn(), deleteOne: jest.fn(),
  },
}));
jest.mock("../../../src/models/schema/projectPolicy.schema", () => ({
  ProjectPolicy: { findOne: jest.fn() },
}));
jest.mock("../../../src/models/schema/project.schema", () => ({
  Project: { findById: jest.fn() },
}));

import { PasswordPolicyService } from "../../../src/passwordPolicy/passwordPolicy.service";
import { PasswordPolicy } from "../../../src/models/schema/passwordPolicy.schema";
import { ProjectPolicy }  from "../../../src/models/schema/projectPolicy.schema";
import { Project }        from "../../../src/models/schema/project.schema";

beforeEach(() => jest.clearAllMocks());

const service   = new PasswordPolicyService();
const PROJECT_ID = "64f1a2b3c4d5e6f7a8b9c0d3";
const POLICY_ID  = "64f1a2b3c4d5e6f7a8b9c0d6";

const mockPolicy = {
  _id: POLICY_ID, projectId: PROJECT_ID,
  minLength: 8, requireNumbers: true, requireUppercase: true, requireSpecialChars: false,
};

// ─── createPasswordPolicy ─────────────────────────────────────────────────────
describe("PasswordPolicyService.createPasswordPolicy", () => {
  it("returns 404 when the project does not exist", async () => {
    (Project.findById as jest.Mock).mockReturnValue({ lean: () => null });

    const result = await service.createPasswordPolicy(PROJECT_ID, {});
    expect(result.status).toBe(404);
    expect((result.body as any).message).toMatch(/project not found/i);
  });

  it("returns 409 when a policy already exists for the project", async () => {
    (Project.findById as jest.Mock).mockReturnValue({ lean: () => ({ _id: PROJECT_ID }) });
    (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => mockPolicy });

    const result = await service.createPasswordPolicy(PROJECT_ID, {});
    expect(result.status).toBe(409);
    expect((result.body as any).message).toMatch(/already exists/i);
  });

  it("creates the policy with defaults when no overrides are provided", async () => {
    (Project.findById as jest.Mock).mockReturnValue({ lean: () => ({ _id: PROJECT_ID }) });
    (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
    (PasswordPolicy.create as jest.Mock).mockResolvedValue(mockPolicy);

    const result = await service.createPasswordPolicy(PROJECT_ID, {});

    expect(result.status).toBe(201);
    expect((result.body as any).passwordPolicy).toBeDefined();

    const createArg = (PasswordPolicy.create as jest.Mock).mock.calls[0][0];
    expect(createArg.minLength).toBe(6);       // default
    expect(createArg.requireNumbers).toBe(true); // default
  });

  it("applies provided overrides over defaults", async () => {
    (Project.findById as jest.Mock).mockReturnValue({ lean: () => ({ _id: PROJECT_ID }) });
    (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
    (PasswordPolicy.create as jest.Mock).mockResolvedValue({ ...mockPolicy, minLength: 12 });

    await service.createPasswordPolicy(PROJECT_ID, { minLength: 12, requireSpecialChars: true });

    const createArg = (PasswordPolicy.create as jest.Mock).mock.calls[0][0];
    expect(createArg.minLength).toBe(12);
    expect(createArg.requireSpecialChars).toBe(true);
  });
});

// ─── updatePasswordPolicy ─────────────────────────────────────────────────────
describe("PasswordPolicyService.updatePasswordPolicy", () => {
  it("returns 400 when no fields are provided", async () => {
    const result = await service.updatePasswordPolicy(PROJECT_ID, {});
    expect(result.status).toBe(400);
    expect((result.body as any).message).toMatch(/at least one field/i);
  });

  it("returns 400 when minLength is below 4", async () => {
    const result = await service.updatePasswordPolicy(PROJECT_ID, { minLength: 3 });
    expect(result.status).toBe(400);
    expect((result.body as any).message).toMatch(/less than 4/i);
  });

  it("returns 404 when the policy does not exist", async () => {
    (PasswordPolicy.findOneAndUpdate as jest.Mock).mockReturnValue({ lean: () => null });

    const result = await service.updatePasswordPolicy(PROJECT_ID, { minLength: 10 });
    expect(result.status).toBe(404);
  });

  it("returns 200 with updated policy on success", async () => {
    (PasswordPolicy.findOneAndUpdate as jest.Mock).mockReturnValue({ lean: () => ({ ...mockPolicy, minLength: 10 }) });

    const result = await service.updatePasswordPolicy(PROJECT_ID, { minLength: 10 });
    expect(result.status).toBe(200);
    expect((result.body as any).passwordPolicy.minLength).toBe(10);
  });
});

// ─── deletePasswordPolicy ─────────────────────────────────────────────────────
describe("PasswordPolicyService.deletePasswordPolicy", () => {
  it("returns 404 when the policy does not exist", async () => {
    (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });

    const result = await service.deletePasswordPolicy(PROJECT_ID);
    expect(result.status).toBe(404);
  });

  it("returns 400 when a ProjectPolicy still references it", async () => {
    (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => mockPolicy });
    (ProjectPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => ({ _id: "policyId" }) });

    const result = await service.deletePasswordPolicy(PROJECT_ID);
    expect(result.status).toBe(400);
    expect((result.body as any).message).toMatch(/project policy/i);
  });

  it("deletes successfully when no ProjectPolicy references it", async () => {
    (PasswordPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => mockPolicy });
    (ProjectPolicy.findOne as jest.Mock).mockReturnValue({ lean: () => null });
    (PasswordPolicy.deleteOne as jest.Mock).mockResolvedValue({});

    const result = await service.deletePasswordPolicy(PROJECT_ID);
    expect(result.status).toBe(200);
    expect(PasswordPolicy.deleteOne).toHaveBeenCalledWith({ projectId: PROJECT_ID });
  });
});
