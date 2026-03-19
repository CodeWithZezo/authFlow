import { PasswordPolicy } from "../../models/schema/passwordPolicy.schema";
import { ProjectPolicy } from "../../models/schema/projectPolicy.schema";
import { Project } from "../../models/schema/project.schema";
import { IServiceResponse } from "../../types/auth.types";
import { logger } from "../../utils/logger";

interface ICreatePasswordPolicyRequest {
  minLength?: number;
  requireNumbers?: boolean;
  requireUppercase?: boolean;
  requireSpecialChars?: boolean;
}

interface IUpdatePasswordPolicyRequest {
  minLength?: number;
  requireNumbers?: boolean;
  requireUppercase?: boolean;
  requireSpecialChars?: boolean;
}

export class PasswordPolicyService {

  // ─── Create Password Policy ─────────────────────────────────────────────────
  async createPasswordPolicy(
    projectId: string,
    data: ICreatePasswordPolicyRequest
  ): Promise<IServiceResponse<any>> {
    try {
      // Verify project exists
      const project = await Project.findById(projectId).lean();
      if (!project) {
        return { status: 404, body: { message: "Project not found" } };
      }

      // Only one password policy per project (unique index on projectId)
      const existing = await PasswordPolicy.findOne({ projectId }).lean();
      if (existing) {
        return {
          status: 409,
          body: { message: "Password policy already exists for this project. Use PATCH to update." },
        };
      }

      const passwordPolicy = await PasswordPolicy.create({
        projectId,
        minLength: data.minLength ?? 6,
        requireNumbers: data.requireNumbers ?? true,
        requireUppercase: data.requireUppercase ?? true,
        requireSpecialChars: data.requireSpecialChars ?? false,
      });

      return {
        status: 201,
        body: {
          message: "Password policy created successfully",
          passwordPolicy,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "Password policy already exists for this project" } };
      }
      logger.error("PasswordPolicyService.createPasswordPolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get Password Policy ────────────────────────────────────────────────────
  async getPasswordPolicy(projectId: string): Promise<IServiceResponse<any>> {
    try {
      const passwordPolicy = await PasswordPolicy.findOne({ projectId }).lean();

      if (!passwordPolicy) {
        return { status: 404, body: { message: "Password policy not found for this project" } };
      }

      return {
        status: 200,
        body: {
          message: "Password policy fetched successfully",
          passwordPolicy,
        },
      };
    } catch (error) {
      logger.error("PasswordPolicyService.getPasswordPolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update Password Policy ─────────────────────────────────────────────────
  async updatePasswordPolicy(
    projectId: string,
    data: IUpdatePasswordPolicyRequest
  ): Promise<IServiceResponse<any>> {
    try {
      if (Object.keys(data).length === 0) {
        return { status: 400, body: { message: "At least one field is required to update" } };
      }

      // Validate minLength if provided
      if (data.minLength !== undefined && data.minLength < 4) {
        return { status: 400, body: { message: "Minimum password length cannot be less than 4" } };
      }

      const passwordPolicy = await PasswordPolicy.findOneAndUpdate(
        { projectId },
        { $set: { ...data, updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).lean();

      if (!passwordPolicy) {
        return { status: 404, body: { message: "Password policy not found for this project" } };
      }

      return {
        status: 200,
        body: {
          message: "Password policy updated successfully",
          passwordPolicy,
        },
      };
    } catch (error) {
      logger.error("PasswordPolicyService.updatePasswordPolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Delete Password Policy ─────────────────────────────────────────────────
  // Guard: cannot delete if a ProjectPolicy references this password policy
  async deletePasswordPolicy(projectId: string): Promise<IServiceResponse<any>> {
    try {
      const passwordPolicy = await PasswordPolicy.findOne({ projectId }).lean();

      if (!passwordPolicy) {
        return { status: 404, body: { message: "Password policy not found for this project" } };
      }

      // Block deletion if a project policy still references this password policy
      const linkedProjectPolicy = await ProjectPolicy.findOne({
        passwordPolicyId: passwordPolicy._id,
      }).lean();

      if (linkedProjectPolicy) {
        return {
          status: 400,
          body: {
            message: "Cannot delete password policy while a project policy references it. Delete the project policy first.",
          },
        };
      }

      await PasswordPolicy.deleteOne({ projectId });

      return {
        status: 200,
        body: { message: "Password policy deleted successfully" },
      };
    } catch (error) {
      logger.error("PasswordPolicyService.deletePasswordPolicy", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
