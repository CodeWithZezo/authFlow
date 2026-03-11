import { ProjectPolicy } from "../../models/schema/projectPolicy.schema";
import { PasswordPolicy } from "../../models/schema/passwordPolicy.schema";
import { Project } from "../../models/schema/project.schema";
import { IServiceResponse } from "../../types/auth.types";
import { AuthType, AuthMethod } from "../../models/enums";
import { logger } from "../../utils/logger";

interface ICreatePolicyRequest {
  phoneRequired?: boolean;
  authRequired?: boolean;
  authType?: AuthType;
  roles?: string[];
  statuses?: string[];
  authMethods?: AuthMethod[];
}

interface IUpdatePolicyRequest {
  phoneRequired?: boolean;
  authRequired?: boolean;
  authType?: AuthType;
  roles?: string[];
  statuses?: string[];
  authMethods?: AuthMethod[];
}

export class ProjectPolicyService {

  // ─── Create Policy ──────────────────────────────────────────────────────────
  async createPolicy(
    projectId: string,
    data: ICreatePolicyRequest
  ): Promise<IServiceResponse<any>> {
    try {
      // Verify project exists
      const project = await Project.findById(projectId).lean();
      if (!project) {
        return { status: 404, body: { message: "Project not found" } };
      }

      // Check policy doesn't already exist (unique per project)
      const existing = await ProjectPolicy.findOne({ projectId }).lean();
      if (existing) {
        return { status: 409, body: { message: "Policy already exists for this project. Use PATCH to update." } };
      }

      // A password policy must exist before creating a project policy
      const passwordPolicy = await PasswordPolicy.findOne({ projectId }).lean();
      if (!passwordPolicy) {
        return {
          status: 400,
          body: { message: "Password policy must be created before creating a project policy" },
        };
      }

      const policy = await ProjectPolicy.create({
        projectId,
        passwordPolicyId: passwordPolicy._id,
        phoneRequired: data.phoneRequired ?? false,
        authRequired: data.authRequired ?? true,
        authType: data.authType ?? AuthType.PASSWORD,
        roles: data.roles ?? [],
        statuses: data.statuses ?? [],
        authMethods: data.authMethods ?? [],
      });

      return {
        status: 201,
        body: {
          message: "Project policy created successfully",
          policy,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "Policy already exists for this project" } };
      }
      logger.error("ProjectPolicyService.createPolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get Policy ─────────────────────────────────────────────────────────────
  async getPolicy(projectId: string): Promise<IServiceResponse<any>> {
    try {
      const policy = await ProjectPolicy.findOne({ projectId })
        .populate("passwordPolicyId")
        .lean();

      if (!policy) {
        return { status: 404, body: { message: "Policy not found for this project" } };
      }

      return {
        status: 200,
        body: {
          message: "Policy fetched successfully",
          policy,
        },
      };
    } catch (error) {
      logger.error("ProjectPolicyService.getPolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update Policy ──────────────────────────────────────────────────────────
  async updatePolicy(
    projectId: string,
    data: IUpdatePolicyRequest
  ): Promise<IServiceResponse<any>> {
    try {
      if (Object.keys(data).length === 0) {
        return { status: 400, body: { message: "At least one field is required to update" } };
      }

      const policy = await ProjectPolicy.findOneAndUpdate(
        { projectId },
        { $set: { ...data, updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).lean();

      if (!policy) {
        return { status: 404, body: { message: "Policy not found for this project" } };
      }

      return {
        status: 200,
        body: {
          message: "Policy updated successfully",
          policy,
        },
      };
    } catch (error) {
      logger.error("ProjectPolicyService.updatePolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Delete Policy ──────────────────────────────────────────────────────────
  async deletePolicy(projectId: string): Promise<IServiceResponse<any>> {
    try {
      const policy = await ProjectPolicy.findOneAndDelete({ projectId }).lean();

      if (!policy) {
        return { status: 404, body: { message: "Policy not found for this project" } };
      }

      return {
        status: 200,
        body: { message: "Policy deleted successfully" },
      };
    } catch (error) {
      logger.error("ProjectPolicyService.deletePolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
