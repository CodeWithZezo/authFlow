import { Project } from "../../models/schema/project.schema";
import { ProjectMembership } from "../../models/schema/projectMembership.schema";
import { Organization } from "../../models/schema/org.schema";
import { IServiceResponse } from "../../types/auth.types";
import { Role, Status } from "../../models/enums";
import { logger } from "../../utils/logger";

interface ICreateProjectRequest {
  name: string;
  description?: string;
}

interface IUpdateProjectRequest {
  name?: string;
  description?: string;
  status?: Status;
}

interface IAddProjectMemberRequest {
  userId: string;
  role: Role;
}

interface IUpdateProjectMemberRequest {
  role?: Role;
  status?: Status;
}

export class ProjectService {

  // ─── Create Project ─────────────────────────────────────────────────────────
  async createProject(
    orgId: string,
    data: ICreateProjectRequest,
    userId: string
  ): Promise<IServiceResponse<any>> {
    try {
      const { name, description } = data;

      if (!name) {
        return { status: 400, body: { message: "Project name is required" } };
      }

      // Verify org exists
      const org = await Organization.findById(orgId).lean();
      if (!org) {
        return { status: 404, body: { message: "Organization not found" } };
      }

      const project = await Project.create({
        name,
        description,
        organizationId: orgId,
        status: Status.ACTIVE,
      });

      // Auto-assign creator as project manager
      await ProjectMembership.create({
        projectId: project._id,
        userId,
        role: Role.MANAGER,
        status: Status.ACTIVE,
      });

      return {
        status: 201,
        body: {
          message: "Project created successfully",
          project,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "Project name already exists in this organization" } };
      }
      logger.error("ProjectService.createProject", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get All Projects In Org ────────────────────────────────────────────────
  async getProjects(orgId: string): Promise<IServiceResponse<any>> {
    try {
      const org = await Organization.findById(orgId).lean();
      if (!org) {
        return { status: 404, body: { message: "Organization not found" } };
      }

      const projects = await Project.find({ organizationId: orgId }).lean();

      return {
        status: 200,
        body: {
          message: "Projects fetched successfully",
          projects,
        },
      };
    } catch (error) {
      logger.error("ProjectService.getProjects", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get Single Project ─────────────────────────────────────────────────────
  async getProject(
    orgId: string,
    projectId: string
  ): Promise<IServiceResponse<any>> {
    try {
      const project = await Project.findOne({
        _id: projectId,
        organizationId: orgId,
      }).lean();

      if (!project) {
        return { status: 404, body: { message: "Project not found" } };
      }

      return {
        status: 200,
        body: {
          message: "Project fetched successfully",
          project,
        },
      };
    } catch (error) {
      logger.error("ProjectService.getProject", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update Project ─────────────────────────────────────────────────────────
  async updateProject(
    orgId: string,
    projectId: string,
    data: IUpdateProjectRequest
  ): Promise<IServiceResponse<any>> {
    try {
      const project = await Project.findOneAndUpdate(
        { _id: projectId, organizationId: orgId },
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      if (!project) {
        return { status: 404, body: { message: "Project not found" } };
      }

      return {
        status: 200,
        body: {
          message: "Project updated successfully",
          project,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "Project name already exists in this organization" } };
      }
      logger.error("ProjectService.updateProject", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Delete Project ─────────────────────────────────────────────────────────
  async deleteProject(
    orgId: string,
    projectId: string
  ): Promise<IServiceResponse<any>> {
    try {
      const project = await Project.findOneAndDelete({
        _id: projectId,
        organizationId: orgId,
      }).lean();

      if (!project) {
        return { status: 404, body: { message: "Project not found" } };
      }

      // Cascade delete all project memberships
      await ProjectMembership.deleteMany({ projectId });

      return {
        status: 200,
        body: { message: "Project deleted successfully" },
      };
    } catch (error) {
      logger.error("ProjectService.deleteProject", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Add Project Member ─────────────────────────────────────────────────────
  async addProjectMember(
    projectId: string,
    data: IAddProjectMemberRequest
  ): Promise<IServiceResponse<any>> {
    try {
      const { userId, role } = data;

      if (!userId || !role) {
        return { status: 400, body: { message: "userId and role are required" } };
      }

      const project = await Project.findById(projectId).lean();
      if (!project) {
        return { status: 404, body: { message: "Project not found" } };
      }

      const membership = await ProjectMembership.create({
        projectId,
        userId,
        role,
        status: Status.ACTIVE,
      });

      return {
        status: 201,
        body: {
          message: "Member added to project successfully",
          membership,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "User is already a member of this project" } };
      }
      logger.error("ProjectService.addProjectMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get All Project Members ────────────────────────────────────────────────
  async getProjectMembers(projectId: string): Promise<IServiceResponse<any>> {
    try {
      const members = await ProjectMembership.find({ projectId })
        .populate("userId", "fullName email phone isVerified")
        .lean();

      return {
        status: 200,
        body: {
          message: "Project members fetched successfully",
          members,
        },
      };
    } catch (error) {
      logger.error("ProjectService.getProjectMembers", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get Single Project Member ──────────────────────────────────────────────
  async getProjectMember(
    projectId: string,
    userId: string
  ): Promise<IServiceResponse<any>> {
    try {
      const membership = await ProjectMembership.findOne({ projectId, userId })
        .populate("userId", "fullName email phone isVerified")
        .lean();

      if (!membership) {
        return { status: 404, body: { message: "Member not found in this project" } };
      }

      return {
        status: 200,
        body: {
          message: "Project member fetched successfully",
          membership,
        },
      };
    } catch (error) {
      logger.error("ProjectService.getProjectMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update Project Member ──────────────────────────────────────────────────
  async updateProjectMember(
    projectId: string,
    userId: string,
    data: IUpdateProjectMemberRequest
  ): Promise<IServiceResponse<any>> {
    try {
      const { role, status } = data;

      if (!role && !status) {
        return { status: 400, body: { message: "At least one of role or status is required" } };
      }

      const membership = await ProjectMembership.findOneAndUpdate(
        { projectId, userId },
        { $set: { ...(role && { role }), ...(status && { status }) } },
        { new: true, runValidators: true }
      ).lean();

      if (!membership) {
        return { status: 404, body: { message: "Member not found in this project" } };
      }

      return {
        status: 200,
        body: {
          message: "Project member updated successfully",
          membership,
        },
      };
    } catch (error) {
      logger.error("ProjectService.updateProjectMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Remove Project Member ──────────────────────────────────────────────────
  async removeProjectMember(
    projectId: string,
    userId: string
  ): Promise<IServiceResponse<any>> {
    try {
      const membership = await ProjectMembership.findOneAndDelete({
        projectId,
        userId,
      }).lean();

      if (!membership) {
        return { status: 404, body: { message: "Member not found in this project" } };
      }

      return {
        status: 200,
        body: { message: "Member removed from project successfully" },
      };
    } catch (error) {
      logger.error("ProjectService.removeProjectMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
