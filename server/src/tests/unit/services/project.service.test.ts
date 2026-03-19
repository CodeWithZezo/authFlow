jest.mock("../../../app/models/schema/project.schema");
jest.mock("../../../app/models/schema/projectMembership.schema");
jest.mock("../../../app/models/schema/org.schema");

import { ProjectService } from "../../../app/modules/project/project.service";
import { Project } from "../../../app/models/schema/project.schema";
import { ProjectMembership } from "../../../app/models/schema/projectMembership.schema";
import { Organization } from "../../../app/models/schema/org.schema";
import { Role, Status } from "../../../app/models/enums";
import mongoose from "mongoose";

const fakeOrgId = new mongoose.Types.ObjectId().toString();
const fakeUserId = new mongoose.Types.ObjectId().toString();
const fakeProjectId = new mongoose.Types.ObjectId().toString();
const fakeOrg = { _id: fakeOrgId, name: "Acme" };
const fakeProject = { _id: fakeProjectId, name: "Alpha", organizationId: fakeOrgId, status: Status.ACTIVE };

describe("ProjectService", () => {
  let service: ProjectService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectService();
  });

  // ─── createProject ───────────────────────────────────────────────────────────
  describe("createProject", () => {
    it("returns 400 when name is missing", async () => {
      const result = await service.createProject(fakeOrgId, { name: "" }, fakeUserId);
      expect(result.status).toBe(400);
    });

    it("returns 404 when org does not exist", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.createProject(fakeOrgId, { name: "Alpha" }, fakeUserId);
      expect(result.status).toBe(404);
    });

    it("returns 201 and auto-assigns creator as manager", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => fakeOrg });
      (Project.create as jest.Mock).mockResolvedValue(fakeProject);
      (ProjectMembership.create as jest.Mock).mockResolvedValue({});

      const result = await service.createProject(fakeOrgId, { name: "Alpha" }, fakeUserId);
      expect(result.status).toBe(201);
      expect(ProjectMembership.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.MANAGER })
      );
    });

    it("returns 409 on duplicate project name (code 11000)", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => fakeOrg });
      (Project.create as jest.Mock).mockRejectedValue({ code: 11000 });

      const result = await service.createProject(fakeOrgId, { name: "Alpha" }, fakeUserId);
      expect(result.status).toBe(409);
    });
  });

  // ─── getProjects ─────────────────────────────────────────────────────────────
  describe("getProjects", () => {
    it("returns 404 when org not found", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.getProjects(fakeOrgId);
      expect(result.status).toBe(404);
    });

    it("returns 200 with projects list", async () => {
      (Organization.findById as jest.Mock).mockReturnValue({ lean: () => fakeOrg });
      (Project.find as jest.Mock).mockReturnValue({ lean: () => [fakeProject] });

      const result = await service.getProjects(fakeOrgId);
      expect(result.status).toBe(200);
      expect((result.body as any).projects).toHaveLength(1);
    });
  });

  // ─── deleteProject ───────────────────────────────────────────────────────────
  describe("deleteProject", () => {
    it("returns 404 when project not found", async () => {
      (Project.findOneAndDelete as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.deleteProject(fakeOrgId, fakeProjectId);
      expect(result.status).toBe(404);
    });

    it("returns 200 and cascade deletes memberships", async () => {
      (Project.findOneAndDelete as jest.Mock).mockReturnValue({ lean: () => fakeProject });
      (ProjectMembership.deleteMany as jest.Mock).mockResolvedValue({});

      const result = await service.deleteProject(fakeOrgId, fakeProjectId);
      expect(result.status).toBe(200);
      expect(ProjectMembership.deleteMany).toHaveBeenCalledWith({ projectId: fakeProjectId });
    });
  });

  // ─── addProjectMember ───────────────────────────────────────────────────────
  describe("addProjectMember", () => {
    it("returns 400 when userId or role is missing", async () => {
      const result = await service.addProjectMember(fakeProjectId, { userId: "", role: Role.VIEWER });
      expect(result.status).toBe(400);
    });

    it("returns 404 when project not found", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => null });
      const result = await service.addProjectMember(fakeProjectId, { userId: fakeUserId, role: Role.VIEWER });
      expect(result.status).toBe(404);
    });

    it("returns 201 on success", async () => {
      (Project.findById as jest.Mock).mockReturnValue({ lean: () => fakeProject });
      (ProjectMembership.create as jest.Mock).mockResolvedValue({ userId: fakeUserId, role: Role.VIEWER });

      const result = await service.addProjectMember(fakeProjectId, { userId: fakeUserId, role: Role.VIEWER });
      expect(result.status).toBe(201);
    });
  });
});
